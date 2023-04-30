import {hyphenatedToCamelCase, midpoint, toggleClass} from "./helper-functions";
import {
    changeColor,
    directionForwards,
    fadeIn,
    fadeOut, makeColorTransparent,
    moveToTarget,
    off,
    on,
    optionsDelimiter,
    propertiesDelimiter,
    resizeWidth,
    scheduleComplete,
    schedulePostNextPageRender,
    schedulePreNextPageRender,
    scheduleSpan,
    sectionFirstHalf,
    sectionFull,
    sectionSecondHalf,
    turboBeforeRender,
    turboRender
} from "./constants";
import {buildKeyFrameEffect, parseOptions, postRenderPrep, preRenderPrep, skipDefaultAnimation} from "./waapi";

export const popStateCallback = function (event) {
    console.log("-> eventDebug popStateCallback event", event);
}

export const turboClickCallback = function (event) {
    console.log("-> eventDebug turboClickCallback event", event);
}

export const turboBeforeVisitCallback = function (event) {
    console.log("-> eventDebug turboBeforeVisitCallback event", event);
}

export const turboVisitCallback = function (event) {
    console.log("-> eventDebug turboVisitCallback event", event);
    document.preRenderDefaultAnimationExecuted = false

    if (event.detail.action === 'restore')
        document.restorePending = true
    if (event.detail.action === 'replace')
        document.replacePending = true
}

export const turboSubmitStartCallback = function (event) {
    console.log("-> eventDebug turboSubmitStartCallback event", event);
}

export const turboBeforeFetchRequestCallback = function (event) {
    console.log("-> eventDebug turboBeforeFetchRequestCallback event", event);
}

export const turboBeforeFetchResponseCallback = function (event) {
    console.log("-> eventDebug turboBeforeFetchResponseCallback event", event);
}

export const turboSubmitEndCallback = function (event) {
    console.log("-> eventDebug turboSubmitEndCallback event", event);
}

export const turboBeforeCacheCallback = function (event) {
    console.log("-> eventDebug turboBeforeCacheCallback event", event);
}

export const turboBeforeRenderCallback = async function (event) {
    console.log("-> eventDebug turboBeforeRenderCallback event", event);
    let animationPromises = [];
    let defaultSubscribers = [...document.querySelectorAll('[data-orchestrator-default]')];
    let animationControllers = {};
    let debugDelay = 3000;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // Pause rendering
    event.preventDefault();

    // Schedule default renderings
    if (!skipDefaultAnimation() && !document.preRenderDefaultAnimationExecuted) {
        for (const defaultSubscriberIndex in defaultSubscribers) {
            let defaultSubscriber = defaultSubscribers[defaultSubscriberIndex];
            let preSubscription = {
                element: defaultSubscriber,
                animation: document.orchestrator.defaults.preAnimation,
                schedule: schedulePreNextPageRender,
                direction: directionForwards,
                options: 'type=single',
                duration: parseInt(document.orchestrator.defaults.duration),
                format: 'inline'
            };
            if (!document.animations[turboBeforeRender][defaultSubscriber.id])
                document.animations[turboBeforeRender][defaultSubscriber.id] = []
            document.animations[turboBeforeRender][defaultSubscriber.id].push(preSubscription)

            let postSubscription = {
                element: defaultSubscriber,
                animation: document.orchestrator.defaults.postAnimation,
                schedule: schedulePostNextPageRender,
                direction: directionForwards,
                options: 'type=single',
                duration: parseInt(document.orchestrator.defaults.duration),
                format: 'inline'
            };
            if (!document.animations[turboRender][defaultSubscriber.id])
                document.animations[turboRender][defaultSubscriber.id] = []
            document.animations[turboRender][defaultSubscriber.id].push(postSubscription)
        }
    }

    for (const subscriber in document.animations[turboBeforeRender]) {
        let postRenderSubscriber = event.detail.newBody.querySelector(`#${subscriber}`), subscriptionsDefinitions = document.animations[turboBeforeRender][subscriber];
        let preRenderSubscriber = document.getElementById(subscriber);

        console.log("-> DEBUG: turboBeforeRenderCallback() preRenderSubscriber", preRenderSubscriber);
        for (const subscriptionsDefinitionsIndex in subscriptionsDefinitions) {
            let keyframeEffect, options;
            const subscription = subscriptionsDefinitions[subscriptionsDefinitionsIndex], schedule = subscription.schedule;
            !!subscription.options ? options = parseOptions(subscription.options) : options = {};
            if (options.toggleOffClasses) {
                let toggleClassList = options.toggleOffClasses.split(optionsDelimiter);
                for (const toggleClassListIndex in toggleClassList){
                    toggleClass(preRenderSubscriber, toggleClassList[toggleClassListIndex], off);
                }
            }

            if (schedule === scheduleComplete || schedule === schedulePreNextPageRender || (schedule === scheduleSpan && !postRenderSubscriber)) {
                keyframeEffect = buildKeyFrameEffect(subscriber, subscription, sectionFull);
            }

            if (schedule === scheduleSpan && postRenderSubscriber) {
                keyframeEffect = buildKeyFrameEffect(subscriber, subscription, sectionFirstHalf);
            }
            const animationController = new Animation(keyframeEffect, document.timeline);

            animationController.play();
            await sleep(debugDelay);
            preRenderPrep(subscriber, event.detail.newBody);



            animationPromises.push(animationController.finished);
            if (!animationControllers[subscriber]) {
                animationControllers[subscriber] = []
            }
            animationControllers[subscriber].push(animationController);
        }
    }


    await Promise.all(animationPromises);

    for (const subscriber in document.animations[turboBeforeRender]) {
        let postRenderSubscriber = event.detail.newBody.querySelector(`#${subscriber}`), subscriptionsDefinitions = document.animations[turboBeforeRender][subscriber];
        let preRenderSubscriber = document.getElementById(subscriber);

        for (const subscriptionsDefinitionsIndex in subscriptionsDefinitions) {
            const subscription = subscriptionsDefinitions[subscriptionsDefinitionsIndex], schedule = subscription.schedule;
            let animation = subscription.animation, element = subscription.element;
            let boxAfter = subscription.element.getBoundingClientRect();

            if (schedule === scheduleSpan && postRenderSubscriber) {
                if (animation === moveToTarget) {
                    postRenderSubscriber.style.left = boxAfter.left.toString() + 'px';
                    postRenderSubscriber.style.top = boxAfter.top.toString() + 'px';
                }
                if (animation === resizeWidth) {
                    let options = parseOptions(subscription.options);
                    postRenderSubscriber.style.width = midpoint(options.startWidth, options.endWidth);
                    //preRenderSubscriber.style.width = midpoint(options.startWidth, options.endWidth);
                }
                if (animation === fadeIn || animation === fadeOut) {
                    postRenderSubscriber.style.opacity = window.getComputedStyle(element).opacity.toString();
                    //preRenderSubscriber.style.opacity = window.getComputedStyle(element).opacity.toString();
                }
                if (animation === changeColor || animation === makeColorTransparent) {
                    let options = parseOptions(subscription.options);
                    let properties = options.properties.split(propertiesDelimiter);
                    for (const propertiesIndex in properties) {
                        let property = properties[propertiesIndex];
                        postRenderSubscriber.style[hyphenatedToCamelCase(property)] = window.getComputedStyle(element).getPropertyValue(property);
                        //preRenderSubscriber.style[hyphenatedToCamelCase(property)] = window.getComputedStyle(element).getPropertyValue(property);
                    }
                }
            }
            if (postRenderSubscriber)
                postRenderPrep(subscriber, event.detail.newBody);
        }

        delete document.animations['turbo:before-render'][subscriber];
    }

    // Resume rendering
    event.detail.resume();

}

export const turboBeforeStreamRenderCallback = function (event) {
    console.log("-> eventDebug turboBeforeStreamRenderCallback event", event);
}

export const turboRenderCallback = async function (event) {
    console.log("-> eventDebug turboRenderCallback event", event);
    let animationPromises = [];
    let defaultSubscribers = [...document.querySelectorAll('[data-orchestrator-default]')];
    let animationControllers = {};
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let debugDelay = 0;



    for (const subscriber in document.animations[turboRender]) {

        let subscriptions = document.animations[turboRender][subscriber];
        for (const subscriptionsDefinitionsIndex in subscriptions) {
            const subscription = subscriptions[subscriptionsDefinitionsIndex];
            const keyframeEffect = buildKeyFrameEffect(subscriber, subscription, sectionSecondHalf);
            const animationController = new Animation(keyframeEffect, document.timeline);
            animationController.play();
            await sleep(debugDelay);
            animationPromises.push(animationController.finished);
            if (!animationControllers[subscriber]) {
                animationControllers[subscriber] = []
            }
            animationControllers[subscriber].push(animationController);
        }
    }

    document.restorePending = false;

    await Promise.all(animationPromises);

    for (const subscriber in document.animations[turboRender]) {
        delete document.animations[turboRender][subscriber];
    }

    delete document.inlineSubscribers;

}

export const turboLoadCallback = function (event) {
    console.log("-> eventDebug turboLoadCallback event", event);
}

export const turboFrameRenderCallback = function (event) {
    console.log("-> eventDebug turboFrameRenderCallback event", event);
}

export const turboFrameLoadCallback = function (event) {
    console.log("-> eventDebug turboFrameLoadCallback event", event);
}

export const turboFetchRequestErrorCallback = function (event) {
    console.log("-> eventDebug turboFetchRequestErrorCallback event", event);
}
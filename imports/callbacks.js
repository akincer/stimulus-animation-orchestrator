import {fetchItem, hyphenatedToCamelCase, midpoint, storeItem, toggleClass} from "./helper-functions";
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

}

export const turboClickCallback = function (event) {

}

export const turboBeforeVisitCallback = function (event) {

}

export const turboVisitCallback = function (event) {

    document.preRenderDefaultAnimationExecuted = false

    if (event.detail.action === 'restore')
        document.restorePending = true
    if (event.detail.action === 'replace')
        document.replacePending = true
}

export const turboSubmitStartCallback = function (event) {
    console.log("-> eventDebug turboSubmitStartCallback event", event);
    if (!!event.detail && !!event.detail.action) {
        console.log("-> eventDebug turboSubmitStartCallback event.detail.action", event.detail.action);
    }
}

export const turboBeforeFetchRequestCallback = function (event) {
    console.log("-> eventDebug turboBeforeFetchRequestCallback event", event);
    if (!!event.detail && !!event.detail.action) {
        console.log("-> eventDebug turboBeforeFetchRequestCallback event.detail.action", event.detail.action);
    }
}

export const turboBeforeFetchResponseCallback = function (event) {
    console.log("-> eventDebug turboBeforeFetchResponseCallback event", event);
    if (!!event.detail && !!event.detail.action) {
        console.log("-> eventDebug turboBeforeFetchResponseCallback event.detail.action", event.detail.action);
    }
}

export const turboSubmitEndCallback = function (event) {
    console.log("-> eventDebug turboSubmitEndCallback event", event);
    if (!!event.detail && !!event.detail.action) {
        console.log("-> eventDebug turboSubmitEndCallback event.detail.action", event.detail.action);
    }
}

export const turboBeforeCacheCallback = function (event) {
    console.log("-> eventDebug turboBeforeCacheCallback event", event);
    if (!!event.detail && !!event.detail.action) {
        console.log("-> eventDebug turboBeforeCacheCallback event.detail.action", event.detail.action);
    }
}

export const turboBeforeRenderCallback = async function (event) {
    let animationPromises = [];
    let defaultSubscribers = [...document.querySelectorAll('[data-orchestrator-default]')];
    let animationControllers = {};
    let debugDelay = 0;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // Pause rendering
    event.preventDefault();

    // Schedule default renderings
    if (!skipDefaultAnimation() && !document.preRenderDefaultAnimationExecuted) {
        console.log("-> prepwork scheduling defaultSubscribers:", defaultSubscribers);
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
        for (const subscriber in document.animations[turboBeforeRender]) {
            console.log("-> prepwork after default animations subscribers added document.animations[turboBeforeRender][subscriber]", document.animations[turboBeforeRender][subscriber]);
        }

    }

    for (const subscriber in document.animations[turboBeforeRender]) {
        let postRenderSubscriber = event.detail.newBody.querySelector(`#${subscriber}`), keyframeEffectDefinitions = document.animations[turboBeforeRender][subscriber];
        let preRenderSubscriber = document.getElementById(subscriber);

        for (const keyframeEffectDefinitionsIndex in keyframeEffectDefinitions) {
            let keyframeEffect, options;
            const keyframeEffectDefinition = keyframeEffectDefinitions[keyframeEffectDefinitionsIndex], schedule = keyframeEffectDefinition.schedule;
            console.log("-> turboBeforeRenderCallback keyframeEffectDefinition", keyframeEffectDefinition);
            !!keyframeEffectDefinition.options ? options = parseOptions(keyframeEffectDefinition.options) : options = {};
            if (options.toggleOffClasses) {
                let toggleClassList = options.toggleOffClasses.split(optionsDelimiter);
                for (const toggleClassListIndex in toggleClassList){
                    toggleClass(preRenderSubscriber, toggleClassList[toggleClassListIndex], off);
                }
            }

            if (schedule === scheduleComplete || schedule === schedulePreNextPageRender || (schedule === scheduleSpan && !postRenderSubscriber)) {
                keyframeEffect = buildKeyFrameEffect(subscriber, keyframeEffectDefinition, sectionFull);
            }

            if (schedule === scheduleSpan && postRenderSubscriber) {
                keyframeEffect = buildKeyFrameEffect(subscriber, keyframeEffectDefinition, sectionFirstHalf);
            }
            const animationController = new Animation(keyframeEffect, document.timeline);

            console.log("-> turboBeforeRenderCallback animationDebug Playing animation for subscriber", subscriber);
            console.log("-> turboBeforeRenderCallback animationDebug animation", keyframeEffectDefinition.animation);
            console.log("-> turboBeforeRenderCallback animationDebug subscription", keyframeEffectDefinition);
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
        let postRenderSubscriber = event.detail.newBody.querySelector(`#${subscriber}`), keyframeEffectDefinitions = document.animations[turboBeforeRender][subscriber];
        let preRenderSubscriber = document.getElementById(subscriber);

        for (const keyframeEffectDefinitionsIndex in keyframeEffectDefinitions) {
            const keyframeEffectDefinition = keyframeEffectDefinitions[keyframeEffectDefinitionsIndex], schedule = keyframeEffectDefinition.schedule;
            let animation = keyframeEffectDefinition.animation, element = keyframeEffectDefinition.element;
            let boxAfter = keyframeEffectDefinition.element.getBoundingClientRect();

            if (schedule === scheduleSpan && postRenderSubscriber) {

                //postRenderSubscriber.parentNode.replaceChild(preRenderSubscriber.cloneNode(true), postRenderSubscriber);
                //postRenderSubscriber = event.detail.newBody.querySelector(`#${subscriber}`)

                if (animation === moveToTarget) {
                    postRenderSubscriber.style.left = boxAfter.left.toString() + 'px';
                    postRenderSubscriber.style.top = boxAfter.top.toString() + 'px';
                    //preRenderSubscriber.style.left = boxAfter.left.toString() + 'px';
                    //preRenderSubscriber.style.top = boxAfter.top.toString() + 'px';
                }
                if (animation === resizeWidth) {
                    let options = parseOptions(keyframeEffectDefinition.options);
                    postRenderSubscriber.style.width = midpoint(options.startWidth, options.endWidth);
                    //preRenderSubscriber.style.width = midpoint(options.startWidth, options.endWidth);
                }
                if (animation === fadeIn || animation === fadeOut) {
                    postRenderSubscriber.style.opacity = window.getComputedStyle(element).opacity.toString();
                    //preRenderSubscriber.style.opacity = window.getComputedStyle(element).opacity.toString();
                }
                if (animation === changeColor || animation === makeColorTransparent) {
                    let options = parseOptions(keyframeEffectDefinition.options);
                    let properties = options.properties.split(propertiesDelimiter);
                    for (const propertiesIndex in properties) {
                        let property = properties[propertiesIndex];
                        postRenderSubscriber.style[hyphenatedToCamelCase(property)] = window.getComputedStyle(element).getPropertyValue(property);
                        //preRenderSubscriber.style[hyphenatedToCamelCase(property)] = window.getComputedStyle(element).getPropertyValue(property);
                    }
                }
            }

            if (postRenderSubscriber) {
                postRenderPrep(subscriber, event.detail.newBody);
            }
            else
                console.log("-> turboBeforeRenderCallback postRenderSubscriber not found in newBody - postRenderSubscriber:", postRenderSubscriber);
        }


        //for (const animationControllersIndex in animationControllers[subscriber]) {
        //    animationControllers[subscriber][animationControllersIndex].cancel()
        //}

        delete document.animations['turbo:before-render'][subscriber];
    }

    // Resume rendering
    event.detail.resume();


}

export const turboBeforeStreamRenderCallback = function (event) {
    console.log("-> eventDebug turboBeforeStreamRenderCallback event", event);
    if (!!event.detail && !!event.detail.action) {
        console.log("-> eventDebug turboBeforeStreamRenderCallback event.detail.action", event.detail.action);
    }
}

export const turboRenderCallback = async function (event) {
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
            console.log("-> turboBeforeRenderCallback animationDebug Playing animation for subscriber", subscriber);
            console.log("-> turboBeforeRenderCallback animationDebug animation", subscription.animation);
            console.log("-> turboBeforeRenderCallback animationDebug subscription", subscription);
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

}

export const turboFrameRenderCallback = function (event) {

}

export const turboFrameLoadCallback = function (event) {

}

export const turboFetchRequestErrorCallback = function (event) {

}
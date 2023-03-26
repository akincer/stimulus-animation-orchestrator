import {fetchItem, hyphenatedToCamelCase, midpoint, storeItem, toggleClass} from "./helper-functions";
import {
    changeColor,
    directionForwards,
    fadeIn,
    fadeOut,
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
    console.log("-> popStateCallback event", event);
}

export const turboClickCallback = function (event) {
    console.log("-> turboClickCallback event", event);
}

export const turboBeforeVisitCallback = function (event) {
    console.log("-> turboBeforeVisitCallback event", event);
}

export const turboVisitCallback = function (event) {
    console.log("-> turboVisitCallback event", event);
    document.preRenderDefaultAnimationExecuted = false
    if (event.detail.action === 'restore')
        document.restorePending = true
}

export const turboSubmitStartCallback = function (event) {
    console.log("-> turboSubmitStartCallback event", event);
}

export const turboBeforeFetchRequestCallback = function (event) {
    console.log("-> turboBeforeFetchRequestCallback event", event);
}

export const turboBeforeFetchResponseCallback = function (event) {
    console.log("-> turboBeforeFetchResponseCallback event", event);
}

export const turboSubmitEndCallback = function (event) {
    console.log("-> turboSubmitEndCallback event", event);
}

export const turboBeforeCacheCallback = function (event) {
    console.log("-> turboBeforeCacheCallback event", event);
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
            let subscription = {
                element: defaultSubscriber,
                animation: document.defaultPreAnimation,
                schedule: schedulePreNextPageRender,
                direction: directionForwards,
                options: 'type=single',
                duration: parseInt(document.defaultAnimationDuration),
                format: 'inline'
            };
            if (!document.animations[turboBeforeRender][defaultSubscriber.id])
                document.animations[turboBeforeRender][defaultSubscriber.id] = []
            document.animations[turboBeforeRender][defaultSubscriber.id].push(subscription)
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
            console.log("-> turboBeforeRenderCallback keyframeEffect", keyframeEffect);

            animationController.play();
            preRenderPrep(subscriber, event.detail.newBody);



            animationPromises.push(animationController.finished);
            if (!animationControllers[subscriber]) {
                animationControllers[subscriber] = []
            }
            animationControllers[subscriber].push(animationController);
        }
    }

    if (false)
    if (!skipDefaultAnimation() && !document.preRenderDefaultAnimationExecuted) {
        console.log("-> turboBeforeRenderCallback *** Playing default animation ***");
        for (const defaultSubscriberIndex in defaultSubscribers) {
            let defaultSubscriber = defaultSubscribers[defaultSubscriberIndex];
            let animationKeyFrameEffect = buildKeyFrameEffect(defaultSubscriber.id,
                {
                    element: defaultSubscriber,
                    animation: document.defaultPreAnimation,
                    schedule: schedulePreNextPageRender,
                    direction: directionForwards,
                    options: 'type=single',
                    duration: parseInt(document.defaultAnimationDuration),
                    format: 'inline'
                });
            const animationController = new Animation(animationKeyFrameEffect, document.timeline);
            animationController.play();
            preRenderPrep(defaultSubscriber, event.detail.newBody);
            animationPromises.push(animationController.finished);
        }
        document.preRenderDefaultAnimationExecuted = true;
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
                }
                if (animation === resizeWidth) {
                    let options = parseOptions(keyframeEffectDefinition.options);
                    postRenderSubscriber.style.width = midpoint(options.startWidth, options.endWidth);
                }
                if (animation === fadeIn || animation == fadeOut) {
                    postRenderSubscriber.style.opacity = window.getComputedStyle(element).opacity.toString();
                }
                if (animation === changeColor) {
                    let options = parseOptions(keyframeEffectDefinition.options);
                    let properties = options.properties.split(propertiesDelimiter);
                    for (const propertiesIndex in properties) {
                        let property = properties[propertiesIndex];
                        postRenderSubscriber.style[hyphenatedToCamelCase(property)] = window.getComputedStyle(element).getPropertyValue(property);
                    }
                }
            }

            if (postRenderSubscriber) {
                postRenderPrep(subscriber, event.detail.newBody);
            }
            else
                console.log("-> turboBeforeRenderCallback postRenderSubscriber not found in newBody - postRenderSubscriber:", postRenderSubscriber);
        }



        delete document.animations['turbo:before-render'][subscriber];
    }

    // Resume rendering
    event.detail.resume();
}

export const turboBeforeStreamRenderCallback = function (event) {
    console.log("-> turboBeforeStreamRenderCallback event", event);
}

export const turboRenderCallback = async function (event) {
    let animationPromises = [];
    let defaultSubscribers = [...document.querySelectorAll('[data-orchestrator-default]')];
    let animationControllers = {};
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let debugDelay = 0;

    // Schedule default renderings
    if (!skipDefaultAnimation() && !document.preRenderDefaultAnimationExecuted) {
        for (const defaultSubscriberIndex in defaultSubscribers) {
            let defaultSubscriber = defaultSubscribers[defaultSubscriberIndex];
            let subscription = {
                element: defaultSubscriber,
                animation: document.defaultPostAnimation,
                schedule: schedulePostNextPageRender,
                direction: directionForwards,
                options: 'type=single',
                duration: parseInt(document.defaultAnimationDuration),
                format: 'inline'
            };
            if (!document.animations[turboRender][defaultSubscriber.id])
                document.animations[turboRender][defaultSubscriber.id] = []
            document.animations[turboRender][defaultSubscriber.id].push(subscription)
        }
    }


    console.log('-> turboRenderCallback Processing each scheduled animation');
    await sleep(debugDelay);
    for (const subscriber in document.animations[turboRender]) {

        let subscriptions = document.animations[turboRender][subscriber];
        for (const subscriptionsDefinitionsIndex in subscriptions) {
            const subscription = subscriptions[subscriptionsDefinitionsIndex];
            const keyframeEffect = buildKeyFrameEffect(subscriber, subscription, sectionSecondHalf);
            const animationController = new Animation(keyframeEffect, document.timeline);
            animationController.play();
            animationPromises.push(animationController.finished);
            if (!animationControllers[subscriber]) {
                animationControllers[subscriber] = []
            }
            animationControllers[subscriber].push(animationController);
        }
    }

    if (false)
    if (!skipDefaultAnimation() && !document.restorePending) {
        console.log("-> turboRenderCallback *** Playing default animation ***");
        for (const defaultSubscriberIndex in defaultSubscribers) {
            let element = defaultSubscribers[defaultSubscriberIndex]
            let keyframeEffect = buildKeyFrameEffect(element.id,
                {
                    element: element,
                    animation: document.defaultPostAnimation,
                    schedule: schedulePostNextPageRender,
                    direction: directionForwards,
                    options: 'type=single',
                    duration: parseInt(document.defaultAnimationDuration),
                    format: 'inline'
                });
            const animationController = new Animation(keyframeEffect, document.timeline);
            animationController.play();
        }
    }

    document.restorePending = false;

    await Promise.all(animationPromises);

    for (const subscriber in document.animations[turboRender]) {
        let postRenderSubscriber = document.getElementById(subscriber);
        let keyframeEffects = document.animations[turboRender][subscriber];

        for (const keyframeEffectsIndex in keyframeEffects) {
            const keyframeEffect = keyframeEffects[keyframeEffectsIndex];

            if (keyframeEffect.schedule === scheduleSpan && postRenderSubscriber) {
                if (document.moveToTarget[subscriber]) {
                    //let rect = postRenderSubscriber.getBoundingClientRect();
                    //postRenderSubscriber.style.left = rect.left.toString() + 'px';
                    //postRenderSubscriber.style.top = rect.top.toString() + 'px';
                    //delete document.moveToTarget[subscriber];
                }

                if (document.resizeWidth[subscriber]) {
                    //let rect = postRenderSubscriber.getBoundingClientRect();
                    //console.log("-> turboRenderCallback CHANGING WIDTH FOR nextPageSubscriber", postRenderSubscriber);
                    //postRenderSubscriber.style.width = rect.width.toString() + 'px';
                    //delete document.resizeWidth[subscriber];
                }

                if (document.changeColor[subscriber]) {
                    //console.log("-> BEFORE cancel - window.getComputedStyle(nextPageSubscriber).getPropertyValue('background-color')", window.getComputedStyle(postRenderSubscriber).getPropertyValue('background-color'));
                    //postRenderSubscriber.style.backgroundColor = window.getComputedStyle(postRenderSubscriber).getPropertyValue('background-color');
                    //delete document.changeColor[subscriber];
                    //console.log("-> AFTER cancel - window.getComputedStyle(nextPageSubscriber).getPropertyValue('background-color')", window.getComputedStyle(postRenderSubscriber).getPropertyValue('background-color'));
                }
            }
        }

        //console.log('-> turboRenderCallback Before looping to cancel animations');
        //await sleep(debugDelay);


        for (const animationControllersIndex in animationControllers[subscriber]) {
            //console.log("-> Canceling animationControllers[subscriber][animationControllersIndex]", animationControllers[subscriber][animationControllersIndex]);
            //animationControllers[subscriber][animationControllersIndex].cancel()
            //let keyframeEffectDefinitions = document.animations[turboRender][subscriber];
            //let postRenderSubscriber = document.getElementById(subscriber);
            //for (const keyframeEffectDefinitionsIndex in keyframeEffectDefinitions) {
            //    const keyframeEffectDefinition = keyframeEffectDefinitions[keyframeEffectDefinitionsIndex];
            //    let options = parseOptions(keyframeEffectDefinition.options);
            //    if (options.toggleClasses) {
            //        let toggleClassList = options.toggleClasses.split(optionsDelimiter);
            //        for (const toggleClassListIndex in toggleClassList){
            //           toggleClass(postRenderSubscriber, toggleClassList[toggleClassListIndex], on);
            //       }
            //   }
            //}
        }

        //console.log('-> turboRenderCallback After looping to cancel animations');
        //await sleep(debugDelay);
        delete document.animations[turboRender][subscriber];
    }

    delete document.inlineSubscribers;
}

export const turboLoadCallback = function (event) {
    console.log("-> turboLoadCallback event", event);
}

export const turboFrameRenderCallback = function (event) {
    console.log("-> turboFrameRenderCallback event", event);
}

export const turboFrameLoadCallback = function (event) {
    console.log("-> turboFrameLoadCallback event", event);
}

export const turboFetchRequestErrorCallback = function (event) {
    console.log("-> turboFetchRequestErrorCallback event", event);
}
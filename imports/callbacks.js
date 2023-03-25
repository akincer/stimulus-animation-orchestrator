import {fetchItem, hyphenatedToCamelCase, storeItem, toggleClass} from "./helper-functions";
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
    schedule,
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
import {buildKeyFrameEffect, parseOptions, skipDefaultAnimation} from "./waapi";

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
    let debugDelay = 3000;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // Pause rendering
    event.preventDefault();

    console.log("->turboBeforeRenderCallback document.animations[turboBeforeRender]", document.animations[turboBeforeRender]);

    console.log('-> turboBeforeRenderCallback Before loop through and play all animations');
    await sleep(debugDelay);
    for (const subscriber in document.animations[turboBeforeRender]) {
        let postRenderSubscriber = event.detail.newBody.querySelector(`#${subscriber}`), keyframeEffectDefinitions = document.animations[turboBeforeRender][subscriber];
        let element = document.getElementById(subscriber);

        for (const keyframeEffectDefinitionsIndex in keyframeEffectDefinitions) {
            let keyframeEffect, options;
            const keyframeEffectDefinition = keyframeEffectDefinitions[keyframeEffectDefinitionsIndex], schedule = keyframeEffectDefinition.schedule;
            !!keyframeEffectDefinition.options ? options = parseOptions(keyframeEffectDefinition.options) : options = {};
            if (options.toggleClasses) {
                let toggleClassList = options.toggleClasses.split(optionsDelimiter);
                for (const toggleClassListIndex in toggleClassList){
                    toggleClass(postRenderSubscriber, toggleClassList[toggleClassListIndex], off);
                }
            }

            if (schedule === scheduleComplete || schedule === schedulePreNextPageRender || (schedule === scheduleSpan && !postRenderSubscriber)) {
                keyframeEffect = buildKeyFrameEffect(subscriber, keyframeEffectDefinition, sectionFull);
                //animationKeyFrameEffect = buildKeyFrameEffect(subscriber, document.animations['turbo:before-render'][subscriber], sectionFull);
            }

            if (schedule === scheduleSpan && postRenderSubscriber) {
                keyframeEffect = buildKeyFrameEffect(subscriber, keyframeEffectDefinition, sectionFirstHalf);
                // animationKeyFrameEffect = buildKeyFrameEffect(subscriber, document.animations['turbo:before-render'][subscriber], sectionFirstHalf);
            }
            const animationController = new Animation(keyframeEffect, document.timeline);
            console.log("----------- buildKeyFrameEffect Pre play -----------")
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect background-color", window.getComputedStyle(element).getPropertyValue('background-color'));
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect border-color", window.getComputedStyle(element).getPropertyValue('border-color'));
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect color", window.getComputedStyle(element).getPropertyValue('color'));
            console.log("----------- buildKeyFrameEffect ---------------------")
            console.log('-> turboBeforeRenderCallback About to play keyframeEffectDefinition: ', keyframeEffectDefinition);
            await sleep(debugDelay);
            animationController.play();
            console.log("----------- buildKeyFrameEffect Post play ----------")
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect background-color", window.getComputedStyle(element).getPropertyValue('background-color'));
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect border-color", window.getComputedStyle(element).getPropertyValue('border-color'));
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect color", window.getComputedStyle(element).getPropertyValue('color'));
            console.log("----------- buildKeyFrameEffect --------------------")

            animationPromises.push(animationController.finished);
            if (!animationControllers[subscriber]) {
                animationControllers[subscriber] = []
            }
            animationControllers[subscriber].push(animationController);
        }
    }
    console.log('-> turboBeforeRenderCallback After loop through and play all animations');
    await sleep(debugDelay);



    if (!skipDefaultAnimation() && !document.preRenderDefaultAnimationExecuted) {
        console.log("-> turboBeforeRenderCallback *** Playing default animation ***");
        for (const defaultSubscriberIndex in defaultSubscribers) {
            let element = defaultSubscribers[defaultSubscriberIndex];
            let animationKeyFrameEffect = buildKeyFrameEffect(element.id,
                {
                    element: element,
                    animation: document.defaultPreAnimation,
                    schedule: schedulePreNextPageRender,
                    direction: directionForwards,
                    options: 'type=single',
                    duration: parseInt(document.defaultAnimationDuration),
                    format: 'inline'
                });
            const animationController = new Animation(animationKeyFrameEffect, document.timeline);
            animationController.play();
            animationPromises.push(animationController.finished);
        }
        document.preRenderDefaultAnimationExecuted = true;
    }

    console.log('-> turboBeforeRenderCallback Before await animations to complete');
    await sleep(debugDelay);
    await Promise.all(animationPromises);
    console.log('-> turboBeforeRenderCallback Before await animations to complete. Next up is changing permanent settings on target element');
    await sleep(debugDelay);

    for (const subscriber in document.animations[turboBeforeRender]) {
        let postRenderSubscriber = event.detail.newBody.querySelector(`#${subscriber}`), keyframeEffectDefinitions = document.animations[turboBeforeRender][subscriber];
        let preRenderSubscriber = document.getElementById(subscriber);
        console.log("-> turboBeforeRenderCallback document", document);
        console.log("-> turboBeforeRenderCallback subscriber", subscriber);
        console.log("-> turboBeforeRenderCallback postRenderSubscriber", postRenderSubscriber);
        console.log("-> turboBeforeRenderCallback preRenderSubscriber", preRenderSubscriber);

        for (const keyframeEffectDefinitionsIndex in keyframeEffectDefinitions) {
            const keyframeEffectDefinition = keyframeEffectDefinitions[keyframeEffectDefinitionsIndex], schedule = keyframeEffectDefinition.schedule;
            let animation = keyframeEffectDefinition.animation, element = keyframeEffectDefinition.element;
            let boxAfter = keyframeEffectDefinition.element.getBoundingClientRect();
            console.log("-> Animation Troubleshooting: turboBeforeRenderCallback - looping through to set values on element in newBody -  keyframeEffectDefinition:", keyframeEffectDefinition);
            console.log("-> Animation Troubleshooting: turboBeforeRenderCallback - looping through to set values on element in newBody -  element:", element);
            if (schedule === scheduleSpan && postRenderSubscriber) {

                // Replace the postRenderSubscriber with the animated preRenderSubscriber
                postRenderSubscriber.parentNode.replaceChild(preRenderSubscriber.cloneNode(true), postRenderSubscriber);

                // use preRenderSubscriber and postRenderSubscriber
                if (animation === moveToTarget) {
                    //postRenderSubscriber.style.left = boxAfter.left.toString() + 'px';
                    //postRenderSubscriber.style.top = boxAfter.top.toString() + 'px';
                    //console.log('-> turboBeforeRenderCallback Set permanent left and top for nextPageSubscriberkeyframeEffectDefinition: ', keyframeEffectDefinition);
                    //await sleep(debugDelay);
                }
                if (animation === resizeWidth) {
                    //postRenderSubscriber.style.width = boxAfter.width.toString() + 'px';
                    //console.log('-> turboBeforeRenderCallback Set permanent width for nextPageSubscriber keyframeEffectDefinition: ', keyframeEffectDefinition);
                    //await sleep(debugDelay);
                }
                if (animation === fadeIn || animation == fadeOut) {
                    //postRenderSubscriber.style.opacity = window.getComputedStyle(element).opacity.toString();
                    //console.log('-> turboBeforeRenderCallback Set permanent opacity for nextPageSubscriber keyframeEffectDefinition: ', keyframeEffectDefinition);
                    //await sleep(debugDelay);
                }
                if (animation === changeColor) {
                    //let options = parseOptions(keyframeEffectDefinition.options);
                    //let properties = options.properties.split(propertiesDelimiter);
                    //for (const propertiesIndex in properties) {
                    //    let property = properties[propertiesIndex];
                    //    console.log("-> Animation Troubleshooting: turboBeforeRenderCallback - looping through to set values on element in newBody (setting properties on nextPageSubscriber) -  property:", property);
                    //    postRenderSubscriber.style[hyphenatedToCamelCase(property)] = window.getComputedStyle(element).getPropertyValue(property);
                    //}
                    //console.log('-> turboBeforeRenderCallback Set permanent color for nextPageSubscriber keyframeEffectDefinition: ', keyframeEffectDefinition);
                    //await sleep(debugDelay);
                }
            }
        }
        console.log('-> turboBeforeRenderCallback After setting permanent values on target element');
        await sleep(debugDelay);

        //console.log('-> turboBeforeRenderCallback Before Before canceling scheduled animations');
        //await sleep(debugDelay);
        //for (const animationControllersIndex in animationControllers[subscriber]) {
            //console.log("-> Canceling animationControllers[subscriber][animationControllersIndex]", animationControllers[subscriber][animationControllersIndex]);
            //animationControllers[subscriber][animationControllersIndex].cancel()
        //}
        //console.log('-> turboBeforeRenderCallback After Before canceling scheduled animations');
        //await sleep(debugDelay);

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
    console.log("-> turboRenderCallback event", event);
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let debugDelay = 3000;

    console.log('-> turboRenderCallback Processing each scheduled animation');
    await sleep(debugDelay);
    for (const subscriber in document.animations[turboRender]) {

        let keyframeEffectDefinitions = document.animations[turboRender][subscriber];
        let element = document.getElementById(subscriber);
        let rect = element.getBoundingClientRect();
        for (const keyframeEffectDefinitionsIndex in keyframeEffectDefinitions) {
            const keyframeEffectDefinition = keyframeEffectDefinitions[keyframeEffectDefinitionsIndex];
            const keyframeEffect = buildKeyFrameEffect(subscriber, keyframeEffectDefinition, sectionSecondHalf);
            const animationController = new Animation(keyframeEffect, document.timeline);
            console.log("----------- buildKeyFrameEffect Pre play -----------")
            console.log("-> turboRenderCallback buildKeyFrameEffect background-color", window.getComputedStyle(element).getPropertyValue('background-color'));
            console.log("-> turboRenderCallback buildKeyFrameEffect border-color", window.getComputedStyle(element).getPropertyValue('border-color'));
            console.log("-> turboRenderCallback buildKeyFrameEffect color", window.getComputedStyle(element).getPropertyValue('color'));
            console.log("----------- buildKeyFrameEffect ---------------------")
            console.log('-> turboRenderCallback About to play keyframeEffectDefinition: ', keyframeEffectDefinition);
            await sleep(debugDelay);
            animationController.play();
            console.log("----------- buildKeyFrameEffect Post play ----------")
            console.log("-> turboRenderCallback buildKeyFrameEffect background-color", window.getComputedStyle(element).getPropertyValue('background-color'));
            console.log("-> turboRenderCallback buildKeyFrameEffect border-color", window.getComputedStyle(element).getPropertyValue('border-color'));
            console.log("-> turboRenderCallback buildKeyFrameEffect color", window.getComputedStyle(element).getPropertyValue('color'));
            console.log("----------- buildKeyFrameEffect --------------------")
            animationPromises.push(animationController.finished);
            if (!animationControllers[subscriber]) {
                animationControllers[subscriber] = []
            }
            animationControllers[subscriber].push(animationController);
        }
        console.log('-> turboRenderCallback Finished processing each scheduled animation');
        await sleep(debugDelay);

        //let animationKeyFrameEffect;
        // animationKeyFrameEffect = buildKeyFrameEffect(subscriber, document.animations[turboRender][subscriber], sectionSecondHalf);
        //const animationController = new Animation(animationKeyFrameEffect, document.timeline);
        //animationController.play();
        //animationPromises.push(animationController.finished);
        //if (!animationControllers[subscriber]) {
        //    animationControllers[subscriber] = []
        //}
        //animationControllers[subscriber].push(animationController);
    }

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

    console.log('-> turboRenderCallback Before awaiting for animations to finish');
    await sleep(debugDelay);
    await Promise.all(animationPromises);
    console.log('-> turboRenderCallback After awaiting for animations to finish. Next is setting permanent style values on target element');
    await sleep(debugDelay);

    for (const subscriber in document.animations[turboRender]) {
        let postRenderSubscriber = document.getElementById(subscriber);
        let keyframeEffects = document.animations[turboRender][subscriber];

        for (const keyframeEffectsIndex in keyframeEffects) {
            const keyframeEffect = keyframeEffects[keyframeEffectsIndex];

            if (keyframeEffect[schedule] === scheduleSpan && postRenderSubscriber) {
                if (document.moveToTarget[subscriber]) {
                    let rect = postRenderSubscriber.getBoundingClientRect();
                    postRenderSubscriber.style.left = rect.left.toString() + 'px';
                    postRenderSubscriber.style.top = rect.top.toString() + 'px';
                    delete document.moveToTarget[subscriber];
                }

                if (document.resizeWidth[subscriber]) {
                    let rect = postRenderSubscriber.getBoundingClientRect();
                    console.log("-> turboRenderCallback CHANGING WIDTH FOR nextPageSubscriber", postRenderSubscriber);
                    postRenderSubscriber.style.width = rect.width.toString() + 'px';
                    delete document.resizeWidth[subscriber];
                }

                if (document.changeColor[subscriber]) {
                    console.log("-> BEFORE cancel - window.getComputedStyle(nextPageSubscriber).getPropertyValue('background-color')", window.getComputedStyle(postRenderSubscriber).getPropertyValue('background-color'));
                    postRenderSubscriber.style.backgroundColor = window.getComputedStyle(postRenderSubscriber).getPropertyValue('background-color');
                    delete document.changeColor[subscriber];
                    console.log("-> AFTER cancel - window.getComputedStyle(nextPageSubscriber).getPropertyValue('background-color')", window.getComputedStyle(postRenderSubscriber).getPropertyValue('background-color'));
                }
            }
        }

        console.log('-> turboRenderCallback Before looping to cancel animations');
        await sleep(debugDelay);


        for (const animationControllersIndex in animationControllers[subscriber]) {
            //console.log("-> Canceling animationControllers[subscriber][animationControllersIndex]", animationControllers[subscriber][animationControllersIndex]);
            animationControllers[subscriber][animationControllersIndex].cancel()
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

        console.log('-> turboRenderCallback After looping to cancel animations');
        await sleep(debugDelay);
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
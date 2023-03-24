import {fetchItem, hyphenatedToCamelCase, storeItem} from "./helper-functions";
import {
    changeColor,
    directionForwards, fadeIn, fadeOut, moveToTarget, propertiesDelimiter, resizeWidth, schedule,
    scheduleComplete,
    schedulePostNextPageRender, schedulePreNextPageRender,
    scheduleSpan,
    sectionFirstHalf,
    sectionFull,
    sectionSecondHalf, turboBeforeRender, turboRender
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

    // Pause rendering
    event.preventDefault();

    console.log("->turboBeforeRenderCallback document.animations['turbo:before-render']", document.animations['turbo:before-render']);

    for (const subscriber in document.animations[turboBeforeRender]) {
        let nextPageSubscriber = event.detail.newBody.querySelector(`#${subscriber}`), keyframeEffectDefinitions = document.animations[turboBeforeRender][subscriber];
        let element = document.getElementById(subscriber);

        for (const keyframeEffectDefinitionsIndex in keyframeEffectDefinitions) {
            let keyframeEffect;
            const keyframeEffectDefinition = keyframeEffectDefinitions[keyframeEffectDefinitionsIndex], schedule = keyframeEffectDefinition.schedule;

            if (schedule === scheduleComplete || schedule === schedulePreNextPageRender || (schedule === scheduleSpan && !nextPageSubscriber)) {
                keyframeEffect = buildKeyFrameEffect(subscriber, keyframeEffectDefinition, sectionFull);
                //animationKeyFrameEffect = buildKeyFrameEffect(subscriber, document.animations['turbo:before-render'][subscriber], sectionFull);
            }

            if (schedule === scheduleSpan && nextPageSubscriber) {
                keyframeEffect = buildKeyFrameEffect(subscriber, keyframeEffectDefinition, sectionFirstHalf);
                // animationKeyFrameEffect = buildKeyFrameEffect(subscriber, document.animations['turbo:before-render'][subscriber], sectionFirstHalf);
            }
            const animationController = new Animation(keyframeEffect, document.timeline);
            console.log("----------- buildKeyFrameEffect Pre play -----------")
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect background-color", window.getComputedStyle(element).getPropertyValue('background-color'));
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect border-color", window.getComputedStyle(element).getPropertyValue('border-color'));
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect color", window.getComputedStyle(element).getPropertyValue('color'));
            console.log("----------- buildKeyFrameEffect ---------------------")
            animationController.play();
            console.log("----------- buildKeyFrameEffect Post play ----------")
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect background-color", window.getComputedStyle(element).getPropertyValue('background-color'));
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect border-color", window.getComputedStyle(element).getPropertyValue('border-color'));
            console.log("-> turboBeforeRenderCallback buildKeyFrameEffect color", window.getComputedStyle(element).getPropertyValue('color'));
            console.log("----------- buildKeyFrameEffect --------------------")

            animationPromises.push(animationController.finished);
        }
    }

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

    await Promise.all(animationPromises);

    for (const subscriber in document.animations[turboBeforeRender]) {
        let nextPageSubscriber = event.detail.newBody.querySelector(`#${subscriber}`), keyframeEffectDefinitions = document.animations[turboBeforeRender][subscriber];

        for (const keyframeEffectDefinitionsIndex in keyframeEffectDefinitions) {
            const keyframeEffectDefinition = keyframeEffectDefinitions[keyframeEffectDefinitionsIndex], schedule = keyframeEffectDefinition.schedule;
            let animation = keyframeEffectDefinition.animation, element = keyframeEffectDefinition.element;
            let boxAfter = keyframeEffectDefinition.element.getBoundingClientRect();
            if (schedule === scheduleSpan && nextPageSubscriber) {
                if (animation === moveToTarget) {
                    nextPageSubscriber.style.left = boxAfter.left.toString() + 'px';
                    nextPageSubscriber.style.top = boxAfter.top.toString() + 'px';
                }
                if (animation === resizeWidth) {
                    nextPageSubscriber.style.width = boxAfter.width.toString() + 'px';
                }
                if (animation === fadeIn || animation == fadeOut) {
                    nextPageSubscriber.style.opacity = window.getComputedStyle(element).opacity.toString();
                }
                if (animation === changeColor) {
                    console.log("-> window.getComputedStyle(document.animations['turbo:before-render'][subscriber].element).getPropertyValue('background-color')", window.getComputedStyle(document.animations['turbo:before-render'][subscriber].element).getPropertyValue('background-color'));
                    let options = parseOptions(keyframeEffectDefinition.options);
                    let properties = options.properties.split(propertiesDelimiter);
                    for (const propertiesIndex in properties) {
                        let property = properties[propertiesIndex];
                        nextPageSubscriber.style[hyphenatedToCamelCase(property)] = window.getComputedStyle(element).getPropertyValue(property);
                    }
                }
            }
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
    console.log("-> turboRenderCallback event", event);
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

    await Promise.all(animationPromises);

    for (const subscriber in document.animations[turboRender]) {
        let nextPageSubscriber = document.getElementById(subscriber);
        let keyframeEffects = document.animations[turboRender][subscriber];

        for (const keyframeEffectsIndex in keyframeEffects) {
            const keyframeEffect = keyframeEffects[keyframeEffectsIndex];

            if (keyframeEffect[schedule] === scheduleSpan && nextPageSubscriber) {
                if (document.moveToTarget[subscriber]) {
                    let rect = nextPageSubscriber.getBoundingClientRect();
                    nextPageSubscriber.style.left = rect.left.toString() + 'px';
                    nextPageSubscriber.style.top = rect.top.toString() + 'px';
                    delete document.moveToTarget[subscriber];
                }

                if (document.resizeWidth[subscriber]) {
                    let rect = nextPageSubscriber.getBoundingClientRect();
                    console.log("-> turboRenderCallback CHANGING WIDTH FOR nextPageSubscriber", nextPageSubscriber);
                    nextPageSubscriber.style.width = rect.width.toString() + 'px';
                    delete document.resizeWidth[subscriber];
                }

                if (document.changeColor[subscriber]) {
                    console.log("-> BEFORE cancel - window.getComputedStyle(nextPageSubscriber).getPropertyValue('background-color')", window.getComputedStyle(nextPageSubscriber).getPropertyValue('background-color'));
                    nextPageSubscriber.style.backgroundColor = window.getComputedStyle(nextPageSubscriber).getPropertyValue('background-color');
                    delete document.changeColor[subscriber];
                    console.log("-> AFTER cancel - window.getComputedStyle(nextPageSubscriber).getPropertyValue('background-color')", window.getComputedStyle(nextPageSubscriber).getPropertyValue('background-color'));
                }
            }
        }

        for (const animationControllersIndex in animationControllers[subscriber]) {
            animationControllers[subscriber][animationControllersIndex].cancel()
        }
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
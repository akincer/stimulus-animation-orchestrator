import {fetchItem, storeItem} from "./helper-functions";
import {
    directionForwards,
    scheduleComplete,
    schedulePostNextPageRender, schedulePreNextPageRender,
    scheduleSpan,
    sectionFirstHalf,
    sectionFull,
    sectionSecondHalf
} from "./constants";
import {buildKeyFrameEffect, skipDefaultAnimation} from "./waapi";

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

    for (const subscriber in document.animations['turbo:before-render']) {
        let element = document.getElementById(subscriber);
        let rect = element.getBoundingClientRect();
        console.log("-> turboBeforeRenderCallback element to animate", element, 'rect', rect);

        let animationKeyFrameEffect;
        let nextPageSubscriber = event.detail.newBody.querySelector(`#${subscriber}`);

        if (document.animations['turbo:before-render'][subscriber]['schedule'] === schedulePreNextPageRender || (document.animations['turbo:before-render'][subscriber]['schedule'] === scheduleSpan && !nextPageSubscriber)) {
            animationKeyFrameEffect = buildKeyFrameEffect(subscriber, document.animations['turbo:before-render'][subscriber], sectionFull);
        }

        if (document.animations['turbo:before-render'][subscriber]['schedule'] === scheduleSpan && nextPageSubscriber) {
            animationKeyFrameEffect = buildKeyFrameEffect(subscriber, document.animations['turbo:before-render'][subscriber], sectionFirstHalf);
        }

        console.log("-> turboBeforeRenderCallback animationKeyFrameEffect", animationKeyFrameEffect);

        const animationController = new Animation(animationKeyFrameEffect, document.timeline);
        animationController.play();
        animationPromises.push(animationController.finished);
        //delete document.animations['turbo:before-render'][subscriber];
    }

    if (!skipDefaultAnimation() && !document.preRenderDefaultAnimationExecuted) {
        console.log("-> turboBeforeRenderCallback *** Playing default animation ***");
        for (const defaultSubscriberIndex in defaultSubscribers) {
            let element = defaultSubscribers[defaultSubscriberIndex];
            let animationKeyFrameEffect = buildKeyFrameEffect(element.id,
                {
                    element: element,
                    detail: document.defaultPreAnimation,
                    schedule: schedulePreNextPageRender,
                    direction: directionForwards,
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

    for (const subscriber in document.animations['turbo:before-render']) {
        let boxAfter = document.animations['turbo:before-render'][subscriber].element.getBoundingClientRect();
        let nextPageSubscriber = event.detail.newBody.querySelector(`#${subscriber}`);
        if (document.animations['turbo:before-render'][subscriber]['schedule'] === scheduleSpan && nextPageSubscriber) {
            nextPageSubscriber.style.left = boxAfter.left.toString() + 'px';
            nextPageSubscriber.style.top = boxAfter.top.toString() + 'px';
            nextPageSubscriber.style.opacity = window.getComputedStyle(document.animations['turbo:before-render'][subscriber].element).toString();
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
    console.log("-> turboRenderCallback event", event);
    for (const subscriber in document.animations['turbo:render']) {
        let element = document.getElementById(subscriber);
        let rect = element.getBoundingClientRect();
        console.log("-> turboRenderCallback element to animate", element, 'rect', rect);
        let animationKeyFrameEffect;
        animationKeyFrameEffect = buildKeyFrameEffect(subscriber, document.animations['turbo:render'][subscriber], sectionSecondHalf);
        const animationController = new Animation(animationKeyFrameEffect, document.timeline);
        animationController.play();
        animationPromises.push(animationController.finished);
    }

    if (!skipDefaultAnimation() && !document.restorePending) {
        console.log("-> turboRenderCallback *** Playing default animation ***");
        for (const defaultSubscriberIndex in defaultSubscribers) {
            let element = defaultSubscribers[defaultSubscriberIndex]
            let animationKeyFrameEffect = buildKeyFrameEffect(element.id,
                {
                    element: element,
                    detail: document.defaultPostAnimation,
                    schedule: schedulePostNextPageRender,
                    direction: directionForwards,
                    duration: parseInt(document.defaultAnimationDuration),
                    format: 'inline'
                });
            const animationController = new Animation(animationKeyFrameEffect, document.timeline);
            animationController.play();

        }
    }
    document.restorePending = false;

    await Promise.all(animationPromises);
    for (const subscriber in document.animations['turbo:render']) {
        //let boxAfter = document.animations['turbo:render'][subscriber].element.getBoundingClientRect();
        let nextPageSubscriber = document.getElementById(subscriber);
        let boxAfter = nextPageSubscriber.getBoundingClientRect();
        if (document.animations['turbo:render'][subscriber]['schedule'] === scheduleSpan && nextPageSubscriber) {
            if (document.moveToTarget[subscriber]) {
                let rect = nextPageSubscriber.getBoundingClientRect();
                console.log("-> turboRenderCallback rect BEFORE", rect);
                nextPageSubscriber.style.left = rect.left.toString() + 'px';
                nextPageSubscriber.style.top = rect.top.toString() + 'px';
                rect = nextPageSubscriber.getBoundingClientRect();
                console.log("-> turboRenderCallback rect AFTER", rect);
                console.log("-> turboRenderCallback subscriber", subscriber);
                console.log("-> turboRenderCallback document.moveToTarget[subscriber]['left']", document.moveToTarget[subscriber]['left']);
                console.log("-> turboRenderCallback document.moveToTarget[subscriber]['top']", document.moveToTarget[subscriber]['top']);
                delete document.moveToTarget[subscriber];
            }

            //nextPageSubscriber.style.left = boxAfter.left.toString() + 'px';
            //nextPageSubscriber.style.top = boxAfter.top.toString() + 'px';
            //nextPageSubscriber.style.opacity = window.getComputedStyle(document.animations['turbo:render'][subscriber].element).toString();
        }
        delete document.animations['turbo:render'][subscriber];
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
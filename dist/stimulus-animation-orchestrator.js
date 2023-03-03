import { Controller } from "@hotwired/stimulus";
import {capitalizeFirstLetter, fetchItem, storeItem} from "../imports/helper-functions";
import {
    currentStepNumber,
    flowInstanceId,
    inlineAnimationSubscriptions,
    jsonAnimationSubscriptions,
    navigationSource, positionEnd, positionStart, scheduleComplete, scheduleImmediate, scheduleSpan, sectionFull
} from "../imports/constants";
import * as orchestratorCallbacks from "../imports/callbacks";
import * as orchestratorHelpers from "../imports/helper-functions";
import {buildKeyFrameEffect} from "../imports/waapi";

class src_default extends Controller {
    connect() {
        this.initialize();
        this.getConfig();
        this.getFormState();

        // Store this on document for reference in callbacks
        document.orchestrator = this

        this.addListener('popstate');
        this.addListener('turbo:click');
        this.addListener('turbo:before-visit');
        this.addListener('turbo:visit');
        this.addListener('turbo:submit-start');
        this.addListener('turbo:before-fetch-request');
        this.addListener('turbo:before-fetch-response');
        this.addListener('turbo:submit-end');
        this.addListener('turbo:before-cache');
        this.addListener('turbo:before-render');
        this.addListener('turbo:before-stream-render');
        this.addListener('turbo:render');
        this.addListener('turbo:load');
        this.addListener('turbo:frame-render');
        this.addListener('turbo:fetch-request-error');


    }

    initialize() {
        // Initialize event animations
        if (!document.animations) {
            document.animations = {};
            document.animations['popstate'] = {};
            document.animations['turbo:click'] = {};
            document.animations['turbo:before-visit'] = {};
            document.animations['turbo:visit'] = {};
            document.animations['turbo:submit-start'] = {};
            document.animations['turbo:before-fetch-request'] = {};
            document.animations['turbo:before-fetch-response'] = {};
            document.animations['turbo:submit-end'] = {};
            document.animations['turbo:before-cache'] = {};
            document.animations['turbo:before-render'] = {};
            document.animations['turbo:before-stream-render'] = {};
            document.animations['turbo:render'] = {};
            document.animations['turbo:load'] = {};
            document.animations['turbo:frame-render'] = {};
            document.animations['turbo:frame-load'] = {};
            document.animations['turbo:fetch-request-error'] = {};
            document.animations['immediate'] = {};
        }
    }

    getConfig() {
        if (!("transitionDurationMax" in this.element.dataset)) {
            this.transitionDurationMax = 800;
        } else {
            this.transitionDurationMax = parseInt(this.element.dataset.transitionDurationMax);
        }

        if (!("transitionDurationMin" in this.element.dataset)) {
            this.transitionDurationMin = 200;
        } else {
            this.transitionDurationMin = parseInt(this.element.dataset.transitionDurationMin);
        }

        if (!("defaultTransitionDuration" in this.element.dataset)) {
            this.defaultTransitionDuration = 400;
        } else {
            this.defaultTransitionDuration = parseInt(this.element.dataset.defaultTransitionDuration);
        }

    }

    getFormState() {
        if ("currentStepNumber" in this.element.dataset) {
            storeItem(currentStepNumber, this.element.dataset.currentStepNumber);
        }

        if ("currentStepNumber" in this.element.dataset) {
            storeItem(flowInstanceId, this.element.dataset.currentStepNumber);
        }
    }

    testLoad(event) {
        console.log("-> testLoad event", event);
    }

    getListenerTarget(eventListener) {
        if (eventListener === 'popstate')
            return window;
        else
            return document;
    }

    getCallbackName(eventListener) {
        let callbackName = eventListener;

        // check if event is a turbo event
        if (eventListener.includes(':')) {

            // This generates and sets the name of the callBack function for the turboEvent passed in
            let turboEventParsed = eventListener.split(':');
            callbackName = turboEventParsed[0];
            let turboEventNameParsed = turboEventParsed[1].split('-')
            for (const index in turboEventNameParsed) {
                callbackName += capitalizeFirstLetter(turboEventNameParsed[index]);
            }
        }

        callbackName += 'Callback'

        return callbackName;
    }

    addListener(eventListener, eventListenerCallback = null) {
        let callbackName, callbackFlag, eventListenerTarget;

        callbackName = this.getCallbackName(eventListener);

        // Flag to check if event has already been added
        !!eventListenerCallback ? callbackFlag = 'custom' + capitalizeFirstLetter(callbackName) + 'Added' : callbackFlag = callbackName + 'Added';
        eventListenerTarget = this.getListenerTarget(eventListener);

        if (eventListenerTarget[callbackFlag] !== true) {
            console.log("-> addListener callbackName", callbackName);
            eventListenerTarget.addEventListener(eventListener, !!eventListenerCallback ? eventListenerCallback : orchestratorCallbacks[callbackName])
            eventListenerTarget[callbackFlag] = true
        }

    }

    getKeyEffect(subscriber, subscription) {
        let schedule = subscription['schedule'];
        let element = subscription['element'];
        let detail = subscription['detail'];


    }

    // Plays subscribed animations for the event
    orchestrateSubscribedAnimations(event) {
        let eventSource, eventType = event.type;

        if (eventType === 'popstate')
            eventSource = fetchItem(navigationSource);
        else
            eventSource = event.target.id;

        let inlineSubscribers = this.getSubscribers(eventSource, eventType, inlineAnimationSubscriptions);

        console.log("-> inlineSubscribers", inlineSubscribers);

        // TODO: handle json subscription definitions
        //let jsonSubscribers = this.getSubscribers(eventSource, eventType, jsonAnimationSubscriptions);

        for (const subscriber in inlineSubscribers)
        {
            console.log("-> inlineSubscribers[subscriber]", inlineSubscribers[subscriber]);

            // Schedule animation
            this.scheduleAnimation(subscriber, inlineSubscribers[subscriber])
        }

        // Play immediate animations
        for (const subscriber in document.animations['immediate']) {
            let animationKeyFrameEffect = buildKeyFrameEffect(subscriber, document.animations.immediate[subscriber]);
            const animationController = new Animation(animationKeyFrameEffect, document.timeline);
            animationController.play();
            delete document.animations.immediate[subscriber];
        }
    }



    splitAnimationSubscription(subscriber, subscription) {
        // For spanned animations create two different subscriptions
        let details = subscription['detail'].split(',');

        for (const detailsIndex in details) {
            if (details[detailsIndex].includes('#')) {
                // Contains additional parameters
            }

        }
    }

    scheduleAnimation(subscriber, subscription) {
        let schedule = subscription['schedule'];
        let element = subscription['element'];

        if (schedule === scheduleImmediate) {
            document.animations['immediate'][subscriber] = subscription
        }

        if (schedule === scheduleSpan && getComputedStyle(element).position === 'absolute') {
            // Calculate the middle of each animation and create a subscription for each side of the middle
            document.animations['turbo:before-render'][subscriber] = subscription
            document.animations['turbo:render'][subscriber] = subscription
        }

        if (schedule === scheduleComplete || (schedule === scheduleSpan && getComputedStyle(element).position !== 'absolute')) {
            // If the element is not positioned absolute span will yield unpredictable results so fallback is to let the animation complete before render
            document.animations['turbo:before-render'][subscriber] = subscription
        }
    }

    /*
    buildKeyFrameEffect(subscriber, subscription, section = sectionFull) {
        let startFrame = {};
        let endFrame = {};
        let frameOptions = {};
        let animationDetail = subscription['detail'];
        let schedule = subscription['schedule'];
        let element = subscription['element'];
        let frameFunction;

        let animationSteps = animationDetail.split(',');
        console.log("->buildKeyFrameEffect animationSteps", animationSteps);
        for (const stepIndex in animationSteps) {
            let options = [];
            if (animationSteps[stepIndex].includes('#')) {
                // Additional configuration parameters
            }

            frameFunction = 'get' + capitalizeFirstLetter(animationSteps[stepIndex]) + 'Frame';
            console.log("-> frameFunction", frameFunction);
            let tempFrame = orchestratorHelpers[frameFunction](element, positionStart, section, options);
            for (const property in tempFrame) {
                startFrame[property] ? startFrame[property] += ' ' + tempFrame[property] : startFrame[property] = tempFrame[property];
            }

            tempFrame = orchestratorHelpers[frameFunction](element, positionEnd, section, options);
            for (const property in tempFrame) {
                endFrame[property] ? endFrame[property] += ' ' + tempFrame[property] : endFrame[property] = tempFrame[property];
            }
        }
        console.log("-> startFrame", startFrame);
        console.log("-> endFrame", endFrame);

        frameOptions['duration'] = subscription['duration'];
        frameOptions['fill'] = subscription['direction'];

        return new KeyframeEffect(
            element,
            [
                startFrame,
                endFrame
            ],
            frameOptions
        );
    }

     */

    parseInlineSubscription(subscriptionText) {
        let parsedKeyValuePairs = {};
        let keyValuePairs = subscriptionText.split(':');
        console.log("-> keyValuePairs", keyValuePairs);
        for (const keyValuePairIndex in keyValuePairs) {
            let pair = keyValuePairs[keyValuePairIndex].split('->');
            let key = pair[0];
            let value = pair[1];
            parsedKeyValuePairs[key] = value;
        }

        return parsedKeyValuePairs;
    }

    // Gets the elements subscribed to animate on the event triggered
    getSubscribers(eventSource, eventType, subscriptionDefinitionType) {
        let subscribers = {}, candidateSubscribers = [...document.querySelectorAll('[data-orchestrator-element]')];
        let animationSubscriptions, animationSubscriptionsDefinition, candidateSubscriber, inlineAnimationSubscription;

        for (const candidateSubscriberIndex in candidateSubscribers) {

            candidateSubscriber = candidateSubscribers[candidateSubscriberIndex];

            if (subscriptionDefinitionType in candidateSubscriber.dataset) {

                animationSubscriptionsDefinition = candidateSubscriber.dataset[subscriptionDefinitionType];

                // TODO: Handle JSON subscriptions
                /*
                if (subscriptionDefinitionType === jsonAnimationSubscriptions) {
                    animationSubscriptions = JSON.parse(animationSubscriptionsDefinition);
                    if (animationSubscriptions[eventSource][eventType]) {
                        subscribers[candidateSubscriber.id] = {
                            element: candidateSubscriber,
                            detail: animationSubscriptions[eventSource][eventType],
                            schedule: animationSubscriptions[eventSource][eventType]['schedule'],
                            format: 'JSON'
                        };
                    }
                }

                */

                if (subscriptionDefinitionType === inlineAnimationSubscriptions) {
                    animationSubscriptions = animationSubscriptionsDefinition.split(' ')
                    for (const subscriptionIndex in animationSubscriptions) {
                        //inlineAnimationSubscription = animationSubscriptions[subscriptionIndex].split(':');
                        inlineAnimationSubscription = this.parseInlineSubscription(animationSubscriptions[subscriptionIndex]);
                        if (inlineAnimationSubscription.source === eventSource && inlineAnimationSubscription.event === eventType) {
                            subscribers[candidateSubscriber.id] = {
                                element: candidateSubscriber,
                                detail: inlineAnimationSubscription.detail,
                                schedule: inlineAnimationSubscription.schedule,
                                direction: inlineAnimationSubscription.direction,
                                duration: parseInt(inlineAnimationSubscription.duration),
                                format: 'inline'
                            };
                        }
                    }
                }
            }
        }

        return subscribers;
    }

}

export { src_default as default };
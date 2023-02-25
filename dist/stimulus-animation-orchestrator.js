import { Controller } from "@hotwired/stimulus";
import {capitalizeFirstLetter, fetchItem, storeItem} from "../imports/helper-functions";
import {
    currentStepNumber,
    flowInstanceId,
    inlineAnimationSubscriptions,
    jsonAnimationSubscriptions,
    navigationSource
} from "../imports/constants";
import * as orchestratorCallbacks from "../imports/callbacks";

class src_default extends Controller {
    connect() {
        this.initialize();
        this.getConfig();
        this.getFormState();
    }

    initialize() {
        // Store this on document for reference in callbacks
        document.orchestrator = this

        // Initialize event animations
        if (!document.animations) {
            document.animations = {};
            document.animations['popstate'] = {};
            document.animations['turbo:click'] = {};
            document.animations['turbo:before-visit'] = {};
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

        if (!("defaultTransitionDuration" in this.element.dataset)) {
            this.defaultTransitionDuration = 400;
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

    addListener(eventListener) {
        let callbackName = eventListener

        // check if event is a turbo event
        if (eventListener.includes(':')) {

            // This generates and sets the name of the callBack function for the turboEvent passed in
            let turboEventParsed = eventListener.split(':');
            callbackName = turboEventParsed[0]
            let turboEventNameParsed = turboEventParsed[1].split('-')
            for (const index in turboEventNameParsed) {
                callbackName += capitalizeFirstLetter(turboEventNameParsed[index])
            }
            callbackName = callbackName + 'Callback';
        }

        // Flag to check if event has already been added
        let callbackFlag = callbackName + 'Added';

        if (document[callbackFlag] !== true) {
            document.addEventListener(eventListener, orchestratorCallbacks[callbackName])
            document[callbackFlag] = true
        }

    }

    // Plays subscribed animations for the event
    playSubscribedAnimations(event) {
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
        }
    }

    // Gets the elements subscribed to animate on the event triggered
    getSubscribers(eventSource, eventType, subscriptionDefinitionType) {
        let subscribers = {}, candidateSubscribers = [...document.querySelectorAll('[data-orchestrator-element]')];
        let animationSubscriptions, animationSubscriptionsDefinition, candidateSubscriber, inlineAnimationSubscription;

        for (const candidateSubscriberIndex in candidateSubscribers) {

            candidateSubscriber = candidateSubscribers[candidateSubscriberIndex];

            if (subscriptionDefinitionType in candidateSubscriber.dataset) {

                animationSubscriptionsDefinition = candidateSubscriber.dataset[subscriptionDefinitionType];

                if (subscriptionDefinitionType === jsonAnimationSubscriptions) {
                    animationSubscriptions = JSON.parse(animationSubscriptionsDefinition);
                    if (animationSubscriptions[eventSource][eventType]) {
                        subscribers[candidateSubscriber.id] = {
                            element: candidateSubscriber,
                            detail: animationSubscriptions[eventSource][eventType],
                            completion: animationSubscriptions[eventSource][eventType]['completion'],
                            format: 'JSON'
                        };
                    }
                }

                if (subscriptionDefinitionType === inlineAnimationSubscriptions) {
                    animationSubscriptions = animationSubscriptionsDefinition.split(' ')
                    for (const subscriptionIndex in animationSubscriptions) {
                        inlineAnimationSubscription = animationSubscriptions[subscriptionIndex].split(':');
                        if (inlineAnimationSubscription[0] === eventSource && inlineAnimationSubscription[1] === eventType) {
                            subscribers[candidateSubscriber.id] = {
                                element: candidateSubscriber,
                                detail: inlineAnimationSubscription[2],
                                completion: inlineAnimationSubscription[3],
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
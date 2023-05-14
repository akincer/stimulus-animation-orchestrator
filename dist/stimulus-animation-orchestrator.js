import { Controller } from "@hotwired/stimulus";
import {capitalizeFirstLetter, fetchItem, hyphenatedToCamelCase, storeItem} from "../imports/helper-functions";
import {
    currentStepNumber,
    flowInstanceId,
    inlineAnimationSubscriptions,
    immediate,
    navigationSource,
    scheduleComplete, scheduleImmediate, scheduleNow, schedulePostNextPageRender, schedulePreNextPageRender, scheduleSpan,
    subscriptionDelimiter,
    turboBeforeRender, turboRender
} from "../imports/constants";
import * as orchestratorCallbacks from "../imports/callbacks";
import {buildKeyFrameEffect, parseOptions} from "../imports/waapi";
import {popStateCallback} from "../imports/callbacks";

class src_default extends Controller {
    connect() {
        this.initialize();
        this.getConfig();
        this.getFormState();

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
        if (!document.orchestrator) {
            document.orchestrator = {defaults: {}, forms: {}, animations: {}, config: {}, state: {}};
            document.orchestrator.animations['immediate'] = {};
            document.orchestrator.animations['turbo:before-render'] = {};
            document.orchestrator.animations['turbo:render'] = {};
        }
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
            document.moveToTarget = {};
            document.resizeWidth = {};
            document.changeColor = {};
        }
    }

    getConfig() {



        if (!("orchestratorDefaultAnimationDuration" in this.element.dataset))
            document.orchestrator.defaults.duration = 600;
        else
            document.orchestrator.defaults.duration = parseInt(this.element.dataset.orchestratorDefaultAnimationDuration);

        if (!("orchestratorDefaultFillDirection" in this.element.dataset))
            document.orchestrator.defaults.fillDirection = 'forwards';
        else
            document.orchestrator.defaults.fillDirection = parseInt(this.element.dataset.orchestratorDefaultFillDirection);

        if (!("orchestratorDefaultEasing" in this.element.dataset))
            document.orchestrator.defaults.easing = 'linear';
        else
            document.orchestrator.defaults.easing = parseInt(this.element.dataset.orchestratorDefaultEasing);

        if (!("orchestratorDefaultPreAnimation" in this.element.dataset))
            document.orchestrator.defaults.preAnimation = 'fadeOut';
        else
            document.orchestrator.defaults.preAnimation = this.element.dataset.orchestratorDefaultPreAnimation;

        if (!("orchestratorDefaultPostAnimation" in this.element.dataset))
            document.orchestrator.defaults.postAnimation = 'fadeIn';
        else
            document.orchestrator.defaults.postAnimation = this.element.dataset.orchestratorDefaultPostAnimation;

        if (!("orchestratorDefaultColor" in this.element.dataset))
            document.orchestrator.defaults.color = 'rgb(255,255,255)';
        else
            document.orchestrator.defaults.color = this.element.dataset.orchestratorDefaultColor;

        if (!("orchestratorFormDataSourceId" in this.element.dataset))
            document.orchestrator.forms.formDataSourceId = 'body';
        else
            document.orchestrator.forms.formDataSourceId = this.element.dataset.formDataSourceId;

        if (!("orchestratorUseFormControl" in this.element.dataset))
            document.orchestrator.defaults.useFormControl = false;
        else
            document.orchestrator.defaults.useFormControl = true;

    }

    getFormState() {
        const formDataSource = document.getElementById(document.orchestrator.forms.formDataSourceId)
        let stepNumber;
        if (currentStepNumber in formDataSource.dataset) {
            stepNumber =
            document.orchestrator.forms[currentStepNumber] = formDataSource.dataset[currentStepNumber]
            storeItem(currentStepNumber, formDataSource.dataset.currentStepNumber);
        }

        if (flowInstanceId in formDataSource.dataset) {
            document.orchestrator.forms[flowInstanceId] = formDataSource.dataset[flowInstanceId]
            storeItem(flowInstanceId, formDataSource.dataset.currentStepNumber);
        }
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

        if (typeof document.orchestrator.listeners === 'undefined')
            document.orchestrator.listeners = {}

        callbackName = this.getCallbackName(eventListener);

        // Flag to check if event has already been added
        //eventListenerCallback instanceof Function ? callbackFlag = 'custom' + capitalizeFirstLetter(callbackName) + 'Added' : callbackFlag = callbackName + 'Added';
        if (eventListenerCallback instanceof Function)
            callbackName = 'custom' + capitalizeFirstLetter(callbackName);

        callbackFlag = `${callbackName}Added`;
        eventListenerTarget = this.getListenerTarget(eventListener);

        if (document.orchestrator.listeners[callbackFlag] !== true) {
            if (callbackName === 'popstateCallback')
                eventListenerTarget.addEventListener(eventListener, popStateCallback);
            else if (callbackName === 'customPopstateCallback')
                eventListenerTarget.addEventListener(eventListener, eventListenerCallback);
            else
                eventListenerTarget.addEventListener(eventListener, orchestratorCallbacks[callbackName]);
            //eventListenerTarget.addEventListener(eventListener, eventListenerCallback instanceof Function ? eventListenerCallback : orchestratorCallbacks[callbackName])
            document.orchestrator.listeners[callbackFlag] = true
        }

    }

    orchestrateSubscribedAnimations(event) {
        let eventSource, eventType = event.type;

        if (eventType === 'popstate')
            eventSource = fetchItem(navigationSource);
        else
            eventSource = event.target.id;

        let inlineSubscribers = this.getSubscribers(eventSource, eventType, inlineAnimationSubscriptions);
        document.inlineSubscribers = inlineSubscribers;

        // TODO: handle json subscription definitions
        //let jsonSubscribers = this.getSubscribers(eventSource, eventType, jsonAnimationSubscriptions);

        for (const subscriber in inlineSubscribers)
        {
            this.scheduleAnimation(subscriber, inlineSubscribers[subscriber])
        }

        // Play immediate animations
        for (const subscriber in document.orchestrator.animations[immediate]) {
            let keyframeEffectDefinitions = document.orchestrator.animations[immediate][subscriber]
            for (const keyframeEffectDefinitionsIndex in keyframeEffectDefinitions) {
                let keyframeEffect, options;
                const keyframeEffectDefinition = keyframeEffectDefinitions[keyframeEffectDefinitionsIndex], schedule = keyframeEffectDefinition.schedule;
                !!keyframeEffectDefinition.options ? options = parseOptions(keyframeEffectDefinition.options) : options = {};
                keyframeEffect = buildKeyFrameEffect(subscriber, keyframeEffectDefinition);
                const animationController = new Animation(keyframeEffect, document.timeline);
                animationController.play();
            }

            delete document.orchestrator.animations.immediate[subscriber];
        }
    }

    scheduleAnimation(subscriber, subscriptions) {

        for (const subscriptionIndex in subscriptions) {
            let subscription = subscriptions[subscriptionIndex];
            let schedule = subscription.schedule;
            let element = subscription.element;

            if (schedule === scheduleImmediate || schedule === scheduleNow) {
                if (!document.orchestrator.animations[immediate][subscriber])
                    document.orchestrator.animations[immediate][subscriber] = []
                document.orchestrator.animations[immediate][subscriber].push(subscription);
            }

            if (schedule === scheduleSpan) {
                if (!document.orchestrator.animations[turboRender][subscriber])
                    document.orchestrator.animations[turboRender][subscriber] = []
                document.orchestrator.animations[turboRender][subscriber].push(subscription);

                if (!document.orchestrator.animations[turboBeforeRender][subscriber])
                    document.orchestrator.animations[turboBeforeRender][subscriber] = []
                document.orchestrator.animations[turboBeforeRender][subscriber].push(subscription);
            }

            if (schedule === schedulePreNextPageRender || schedule === scheduleComplete) {
                if (!document.orchestrator.animations[turboBeforeRender][subscriber])
                    document.orchestrator.animations[turboBeforeRender][subscriber] = []
                document.orchestrator.animations[turboBeforeRender][subscriber].push(subscription);
            }

            if (schedule === schedulePostNextPageRender) {
                if (!document.orchestrator.animations[turboRender][subscriber])
                    document.orchestrator.animations[turboRender][subscriber] = []
                document.orchestrator.animations[turboRender][subscriber].push(subscription);
            }
        }
    }

    parseInlineSubscription(subscriptionText) {
        let parsedKeyValuePairs = {};
        let keyValuePairs = subscriptionText.trim().split(':');

        for (const keyValuePairIndex in keyValuePairs) {
            let pair = keyValuePairs[keyValuePairIndex].split(subscriptionDelimiter);
            let key = hyphenatedToCamelCase(pair[0]);
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
            subscribers[candidateSubscriber.id] = [];

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
                    if (animationSubscriptionsDefinition.includes("\n"))
                        animationSubscriptions = animationSubscriptionsDefinition.split("\n")
                    else
                        animationSubscriptions = animationSubscriptionsDefinition.split(' ')
                    for (const subscriptionIndex in animationSubscriptions) {
                        inlineAnimationSubscription = this.parseInlineSubscription(animationSubscriptions[subscriptionIndex]);
                        if (inlineAnimationSubscription.source === eventSource && inlineAnimationSubscription.event === eventType) {
                            subscribers[candidateSubscriber.id].push({
                                element: candidateSubscriber,
                                animation: inlineAnimationSubscription.animation,
                                options: inlineAnimationSubscription.options,
                                schedule: inlineAnimationSubscription.schedule,
                                direction: inlineAnimationSubscription.direction,
                                duration: parseInt(inlineAnimationSubscription.duration),
                                easing: inlineAnimationSubscription.easing,
                                format: 'inline'
                            });
                        }
                    }
                }
            }
        }

        return subscribers;
    }

}

export { src_default as default };
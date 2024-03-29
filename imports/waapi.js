import {
    easeIn, easeOut,
    optionsDelimiter,
    positionEnd,
    positionStart,
    scheduleSpan,
    sectionFirstHalf,
    sectionFull, sectionSecondHalf, turboBeforeRender, turboRender,
    typeSingle
} from "./constants";
import {capitalizeFirstLetter, hyphenatedToCamelCase} from "./helper-functions";
import * as animations from "./animations";
import * as prepFunctions from "./prep-functions";

export function buildKeyFrameEffect(subscriber, subscription, section = sectionFull) {
    let frames = [], startFrame = {}, endFrame = {};
    let frameEffectOptions = {}, frameOptions = {};
    let options = subscription.options;
    let schedule = subscription.schedule;
    let element = document.getElementById(subscriber);
    let frameFunction;

    !!options ? frameOptions = parseOptions(options) : frameOptions = { type: 'single' };
    frameFunction = 'get' + capitalizeFirstLetter(subscription.animation) + 'Frame';

    if (frameOptions.type === typeSingle) {
        let tempFrame = animations[frameFunction](element, positionStart, section, frameOptions);
        for (const property in tempFrame) {
            startFrame[property] ? startFrame[property] += ' ' + tempFrame[property] : startFrame[property] = tempFrame[property];
        }

        tempFrame = animations[frameFunction](element, positionEnd, section, frameOptions);
        for (const property in tempFrame) {
            endFrame[property] ? endFrame[property] += ' ' + tempFrame[property] : endFrame[property] = tempFrame[property];
        }
        frames.push(startFrame, endFrame);
    }


    !!subscription.duration ? frameEffectOptions.duration = subscription.duration : frameEffectOptions.duration = document.defaultAnimationDuration;
    !!subscription.direction ? frameEffectOptions.fill = subscription.direction : frameEffectOptions.fill = document.orchestratorDefaultFillDirection;
    if (!subscription.easing && section === sectionFirstHalf)
        frameEffectOptions.easing = easeIn
    if (!subscription.easing && section === sectionSecondHalf)
        frameEffectOptions.easing = easeOut
    if (!!subscription.easing && section === sectionFull)
        frameEffectOptions.easing = subscription.easing
    if (!subscription.easing)
        frameEffectOptions.easing = document.orchestratorDefaultEasing;


    return new KeyframeEffect(
        element,
        frames,
        frameEffectOptions
    );
}

export function skipDefaultAnimation() {
    let spanScheduled = false;
    for (const subscriber in document.inlineSubscribers) {
        for (const subscriptionIndex in document.inlineSubscribers[subscriber]) {
            if (document.inlineSubscribers[subscriber][subscriptionIndex].schedule === scheduleSpan)
                spanScheduled = true;
        }
    }
    return spanScheduled;
}

export function parseOptions (optionsRaw) {
    let options = {}, optionsData = optionsRaw.split(optionsDelimiter);
    for (const optionIndex in optionsData) {
        let pair = optionsData[optionIndex].split('=');
        let key = hyphenatedToCamelCase(pair[0]);
        let value = pair[1];
        options[key] = value;
    }
    if (!options['type'])
        options['type'] = typeSingle

    return options;
}

export function postRenderPrep(subscriber, newBody) {
    let postRenderSubscriber = newBody.querySelector(`#${subscriber}`)
    let subscriptions = document.animations[turboRender][subscriber];

    for (const subscriptionsIndex in subscriptions) {
        const subscription = subscriptions[subscriptionsIndex];
        let prepFunction = 'do' + capitalizeFirstLetter(subscription.animation) + 'Prep';
        if (typeof prepFunctions[prepFunction] !== 'undefined')
            prepFunctions[prepFunction](postRenderSubscriber, subscription);
    }
}

export function preRenderPrep(subscriber) {
    let preRenderSubscriber = document.getElementById(subscriber);
    let subscriptions = document.animations[turboBeforeRender][subscriber];

    for (const subscriptionsIndex in subscriptions) {
        const subscription = subscriptions[subscriptionsIndex];
        let prepFunction = 'do' + capitalizeFirstLetter(subscription.animation) + 'Prep';
        if (typeof prepFunctions[prepFunction] !== 'undefined')
            prepFunctions[prepFunction](preRenderSubscriber, subscription);
    }
}


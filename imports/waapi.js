import {optionsDelimiter, positionEnd, positionStart, scheduleSpan, sectionFull, typeSingle} from "./constants";
import {capitalizeFirstLetter} from "./helper-functions";
import * as animations from "./animations"

export function buildKeyFrameEffect(subscriber, subscription, section = sectionFull) {
    console.log("-> buildKeyFrameEffect subscriber", subscriber, 'subscription', subscription, 'section', section);
    let frames = [], startFrame = {}, endFrame = {};
    let frameEffectOptions = {}, frameOptions = {};
    let animationDetail = subscription['detail'];
    let schedule = subscription['schedule'];
    let element = document.getElementById(subscriber);
    let frameFunction;

    let animationSteps = animationDetail.split(',');
    console.log("->buildKeyFrameEffect animationSteps", animationSteps);
    for (const stepIndex in animationSteps) {
        if (animationSteps[stepIndex].includes(optionsDelimiter)) {
            // Additional configuration parameters
            frameOptions = parseOptions(animationSteps[stepIndex]);
            frameFunction = 'get' + capitalizeFirstLetter(subscription.animation) + 'Frame';
        } else {
            frameFunction = 'get' + capitalizeFirstLetter(animationSteps[stepIndex]) + 'Frame';
        }

        console.log("-> frameFunction", frameFunction, ' for element ', element);
        if (frameOptions.type === typeSingle) {
            let tempFrame = animations[frameFunction](element, positionStart, section, frameOptions);
            for (const property in tempFrame) {
                startFrame[property] ? startFrame[property] += ' ' + tempFrame[property] : startFrame[property] = tempFrame[property];
            }

            tempFrame = animations[frameFunction](element, positionEnd, section, frameOptions);
            for (const property in tempFrame) {
                endFrame[property] ? endFrame[property] += ' ' + tempFrame[property] : endFrame[property] = tempFrame[property];
            }
            console.log("-> startFrame", startFrame, "endFrame", endFrame, "element", element);
            frames.push(startFrame, endFrame);
        }



    }
    console.log("-> buildKeyFrameEffect startFrame", startFrame, 'frameFunction', frameFunction);
    console.log("-> buildKeyFrameEffect endFrame", endFrame, 'frameFunction', frameFunction);


    !!subscription['duration'] ? frameEffectOptions['duration'] = subscription['duration'] : frameEffectOptions['duration'] = document.defaultAnimationDuration;
    !!subscription['direction'] ? frameEffectOptions['fill'] = subscription['direction'] : frameEffectOptions['fill'] = document.orchestratorDefaultFillDirection;
    !!subscription['easing'] ? frameEffectOptions['easing'] = subscription['easing'] : document.orchestratorDefaultEasing;

    console.log("-> buildKeyFrameEffect frameEffectOptions", frameEffectOptions);

    return new KeyframeEffect(
        element,
        [
            startFrame,
            endFrame
        ],
        frameEffectOptions
    );
}

export function skipDefaultAnimation() {
    let spanScheduled = false;
    for (const subscriber in document.inlineSubscribers) {
        for (const subscriptionIndex in document.inlineSubscribers[subscriber]) {
            if (document.inlineSubscribers[subscriber][subscriptionIndex]['schedule'] === scheduleSpan)
                spanScheduled = true;
        }
    }
    return spanScheduled;
}

export function parseOptions (optionsRaw) {
    let options = {}, optionsData = optionsRaw.split(optionsDelimiter);
    for (const optionIndex in optionsData) {
        let pair = optionsData[optionIndex].split('=');
        if (!optionsData[optionIndex].includes('='))
            console.log("-> optionsData invalid options key pair", optionsData);
        let key = pair[0];
        let value = pair[1];
        options[key] = value;
    }
    if (!options['type'])
        options['type'] = typeSingle

    console.log("-> parseOptions parsed options", options);
    return options;
}
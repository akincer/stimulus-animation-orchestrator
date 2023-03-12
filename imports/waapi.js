import {positionEnd, positionStart, scheduleSpan, sectionFull} from "./constants";
import {capitalizeFirstLetter} from "./helper-functions";
import * as animations from "./animations"

export function buildKeyFrameEffect(subscriber, subscription, section = sectionFull) {
    let startFrame = {};
    let endFrame = {};
    let frameOptions = {};
    let animationDetail = subscription['detail'];
    let schedule = subscription['schedule'];
    let element = document.getElementById(subscriber);
    let frameFunction;

    let animationSteps = animationDetail.split(',');
    console.log("->buildKeyFrameEffect animationSteps", animationSteps);
    for (const stepIndex in animationSteps) {
        if (animationSteps[stepIndex].includes('#')) {
            // Additional configuration parameters
            let options = parseOptions(animationSteps[stepIndex]);
            frameFunction = 'get' + capitalizeFirstLetter(options.animation) + 'Frame';
        } else {
            frameFunction = 'get' + capitalizeFirstLetter(animationSteps[stepIndex]) + 'Frame';
        }

        console.log("-> frameFunction", frameFunction, ' for element ', element);
        let tempFrame = animations[frameFunction](element, positionStart, section, options);
        for (const property in tempFrame) {
            startFrame[property] ? startFrame[property] += ' ' + tempFrame[property] : startFrame[property] = tempFrame[property];
        }

        tempFrame = animations[frameFunction](element, positionEnd, section, options);
        for (const property in tempFrame) {
            endFrame[property] ? endFrame[property] += ' ' + tempFrame[property] : endFrame[property] = tempFrame[property];
        }
    }
    console.log("-> startFrame", startFrame, 'frameFunction', frameFunction);
    console.log("-> endFrame", endFrame, 'frameFunction', frameFunction);

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
    let options = {}, optionsData = optionsRaw.split('#');
    for (const optionIndex in optionsData) {
        if (optionsData[optionIndex].includes('=')) {
            let key = optionsData[optionIndex].split('=')[0], value = optionsData[optionIndex].split('=')[1];
            options[key] = value;
        } else {
            options.animation = optionsData[optionIndex];
        }
    }
    return options;
}
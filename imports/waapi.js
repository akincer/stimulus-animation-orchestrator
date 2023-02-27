import {positionEnd, positionStart, sectionFull} from "./constants";
import {capitalizeFirstLetter} from "./helper-functions";
import * as animations from "./animations"

export function buildKeyFrameEffect(subscriber, subscription, section = sectionFull) {
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
            options = animationSteps[stepIndex].split('#');
            frameFunction = 'get' + capitalizeFirstLetter(options[0]) + 'Frame';
        } else {
            frameFunction = 'get' + capitalizeFirstLetter(animationSteps[stepIndex]) + 'Frame';
        }

        console.log("-> frameFunction", frameFunction);
        let tempFrame = animations[frameFunction](element, positionStart, section, options);
        for (const property in tempFrame) {
            startFrame[property] ? startFrame[property] += ' ' + tempFrame[property] : startFrame[property] = tempFrame[property];
        }

        tempFrame = animations[frameFunction](element, positionEnd, section, options);
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


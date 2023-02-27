import {positionEnd, positionStart, sectionFirstHalf, sectionFull, sectionSecondHalf} from "./constants";
import {capitalizeFirstLetter} from "./helper-functions";

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
        }

        frameFunction = 'get' + capitalizeFirstLetter(animationSteps[stepIndex]) + 'Frame';
        console.log("-> frameFunction", frameFunction);
        let tempFrame = [frameFunction](element, positionStart, section, options);
        for (const property in tempFrame) {
            startFrame[property] ? startFrame[property] += ' ' + tempFrame[property] : startFrame[property] = tempFrame[property];
        }

        tempFrame = [frameFunction](element, positionEnd, section, options);
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

export function getExitToLeftFrame(element, position, section, options = []) {
    let frame = {};
    let rect = element.getBoundingClientRect();

    if (position === positionStart) {
        // Get element's current position
        frame['transform'] = 'translateX(' + rect.left.toString() + 'px)';
    }

    if (position === positionEnd) {
        if (section === sectionFull || section === sectionSecondHalf)
            frame['transform'] = 'translateX(-' + rect.right.toString() + 'px)';

        if (section === sectionFirstHalf)
            frame['transform'] = 'translateX(-' + (rect.right / 2).toString() + 'px)';
    }

    return frame;
}

export function getFadeOutFrame(element, position, section, options = []) {
    let frame = {};

    if (position === positionStart) {
        frame['opacity'] = 1;
    }

    if (position === positionEnd) {
        if (section === sectionFull || section === sectionSecondHalf)
            frame['opacity'] = 0;

        if (section === sectionFirstHalf)
            frame['opacity'] = 0.5;
    }

    return frame;
}
import {positionEnd, positionStart, sectionFirstHalf, sectionFull, sectionSecondHalf} from "./constants";

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

export function getMoveToTargetFrame(element, position, section, options = []) {
    let frame = {};
    let rect = element.getBoundingClientRect();
    console.log("-> getMoveToTargetFrame rect", rect);

    if (position === positionStart) {
        //frame.transform = 'translateX(' + rect.left.toString() + 'px) translateY(' + rect.top.toString() + 'px)';
        frame.transform = 'translateX(0) translateY(0)';
    }

    if (position === positionEnd) {
        let target = document.getElementById(options[1]);
        let targetRect = target.getBoundingClientRect();
        console.log("-> getMoveToTargetFrame targetRect", targetRect);
        let widthOffset = 0, heightOffset = 0, leftOffset = 0, topOffset = 0;
        if(!(typeof options[2] === 'undefined')) {
            widthOffset = parseInt(options[2]);
            leftOffset = widthOffset/2;
        }
        if(!(typeof options[3] === 'undefined')) {
            heightOffset = parseInt(options[3]);
            topOffset = heightOffset/2;
        }
        frame.transform = 'translateX(' + (targetRect.left - leftOffset).toString() + 'px) translateY(' + (targetRect.top - topOffset).toString() + 'px)';
    }

    console.log("-> getMoveToTargetFrame frame", frame);
    console.log("-> getMoveToTargetFrame position", position);

    return frame;
}
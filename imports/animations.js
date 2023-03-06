import {positionEnd, positionStart, sectionFirstHalf, sectionFull, sectionSecondHalf} from "./constants";

export function getExitToLeftFrame(element, position, section, options = []) {
    let frame = {};
    let rect = element.getBoundingClientRect();

    console.log("-> getExitToLeftFrame element", element);
    console.log("-> getExitToLeftFrame rect", rect);

    if (position === positionStart) {
        // Get element's current position
        //frame['transform'] = 'translateX(' + rect.left.toString() + 'px)';
        frame.transform = 'translateX(0) translateY(0)';
    }

    if (position === positionEnd) {
        if (section === sectionFull || section === sectionSecondHalf)
            frame['transform'] = 'translateX(-' + rect.right.toString() + 'px)';

        if (section === sectionFirstHalf)
            frame['transform'] = 'translateX(-' + (rect.right / 2).toString() + 'px)';
    }

    console.log("-> getExitToLeftFrame frame", frame);

    return frame;
}

export function getExitToRightFrame(element, position, section, options = []) {
    let frame = {};
    let rect = element.getBoundingClientRect();

    console.log("-> getExitToRightFrame element", element);
    console.log("-> getExitToRightFrame rect", rect);

    if (position === positionStart) {
        // Get element's current position
        //frame['transform'] = 'translateX(' + rect.left.toString() + 'px)';
        frame.transform = 'translateX(0) translateY(0)';
    }

    if (position === positionEnd) {
        if (section === sectionFull || section === sectionSecondHalf)
            frame['transform'] = 'translateX(' + (window.innerWidth - rect.left).toString() + 'px)';

        if (section === sectionFirstHalf)
            frame['transform'] = 'translateX(' + ((window.innerWidth - rect.left) / 2).toString() + 'px)';
    }

    console.log("-> getExitToRightFrame frame", frame);

    return frame;
}

export function getEnterFromRightFrame(element, position, section, options = []) {
    let frame = {};
    let rect = element.getBoundingClientRect();

    console.log("-> getEnterFromRightFrame element", element);
    console.log("-> getEnterFromRightFrame rect", rect);

    if (position === positionStart) {
        if (section === sectionFull || section === sectionSecondHalf)
            frame['transform'] = 'translateX(' + (window.innerWidth - rect.left).toString() + 'px)';

        if (section === sectionFirstHalf)
            frame['transform'] = 'translateX(' + ((window.innerWidth - rect.left) / 2).toString() + 'px)';
    }

    if (position === positionEnd) {
        frame.transform = 'translateX(0) translateY(0)';
    }

    console.log("-> getEnterFromRightFrame frame", frame);

    return frame;
}

export function getEnterFromLeftFrame(element, position, section, options = []) {
    let frame = {};
    let rect = element.getBoundingClientRect();

    if (position === positionStart) {
        if (section === sectionFull || section === sectionSecondHalf)
            frame['transform'] = 'translateX(-' + (window.innerWidth - rect.left).toString() + 'px)';

        if (section === sectionFirstHalf)
            frame['transform'] = 'translateX(-' + ((window.innerWidth - rect.left) / 2).toString() + 'px)';
    }

    if (position === positionEnd) {
        frame.transform = 'translateX(0) translateY(0)';
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

export function getFadeInFrame(element, position, section, options = []) {
    let frame = {};

    if (position === positionStart) {
        frame['opacity'] = 0;
    }

    if (position === positionEnd) {
        if (section === sectionFull || section === sectionSecondHalf)
            frame['opacity'] = 1;

        if (section === sectionFirstHalf)
            frame['opacity'] = 0.5;
    }

    return frame;
}

export function getMoveToTargetFrame(element, position, section, options = []) {
    let frame = {};
    let rect = element.getBoundingClientRect();
    console.log("-> moveToTarget rect", rect);

    if (position === positionStart) {
        //frame.transform = 'translateX(' + rect.left.toString() + 'px) translateY(' + rect.top.toString() + 'px)';
        frame.transform = 'translateX(0) translateY(0)';
    }

    if (position === positionEnd) {
        let target = document.getElementById(options[1]);
        document.moveToTarget[element.id] = {}
        document.moveToTarget[element.id]['target'] = target.id
        let targetRect = target.getBoundingClientRect();
        console.log("-> moveToTarget targetRect", targetRect);
        let widthOffset = 0, heightOffset = 0, leftOffset = 0, topOffset = 0;
        if(!(typeof options[2] === 'undefined')) {
            widthOffset = parseInt(options[2]);
            leftOffset = widthOffset/2;
        }
        if(!(typeof options[3] === 'undefined')) {
            heightOffset = parseInt(options[3]);
            topOffset = heightOffset/2;
        }
        if (section === sectionFull || section === sectionSecondHalf) {
            frame.transform = 'translateX(' + (targetRect.left - leftOffset - rect.left).toString() + 'px) translateY(' + (targetRect.top - topOffset - rect.top).toString() + 'px)';
            document.moveToTarget[element.id]['left'] = (targetRect.left - leftOffset).toString() + 'px';
            document.moveToTarget[element.id]['top'] = (targetRect.top - topOffset).toString() + 'px';
            console.log("-> moveToTarget X distance", (targetRect.left - leftOffset).toString()+ 'px');
            console.log("-> moveToTarget Y distance", (targetRect.top - topOffset).toString() + 'px');
        }


        if (section === sectionFirstHalf)
            frame.transform = 'translateX(' + ((targetRect.left - leftOffset - rect.left)/2).toString() + 'px) translateY(' + ((targetRect.top - topOffset - rect.top)/2).toString() + 'px)';
    }

    console.log("-> moveToTarget frame", frame);
    console.log("-> moveToTarget position", position);
    console.log("-> moveToTarget section", section);

    return frame;
}
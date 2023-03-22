import {positionEnd, positionStart, sectionFirstHalf, sectionFull, sectionSecondHalf} from "./constants";
import {
    calculateMidpointColor,
    getCssVariableColor,
    getUnit, hyphenatedToCamelCase,
    isCssVariable,
    midpoint,
    midpointColor
} from "./helper-functions";

export function getExitToLeftFrame(element, position, section, options = {}) {
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

export function getExitToRightFrame(element, position, section, options = {}) {
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

export function getEnterFromRightFrame(element, position, section, options = {}) {
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

export function getEnterFromLeftFrame(element, position, section, options = {}) {
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

export function getFadeOutFrame(element, position, section, options = {}) {
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

export function getFadeInFrame(element, position, section, options = {}) {
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

export function getMoveToTargetFrame(element, position, section, options = {}) {
    let frame = {};
    let rect = element.getBoundingClientRect();
    console.log("-> getMoveToTargetFrame element", element);
    console.log("-> moveToTarget rect", rect);
    console.log("-> getMoveToTargetFrame options", options);

    if (position === positionStart) {
        //frame.transform = 'translateX(' + rect.left.toString() + 'px) translateY(' + rect.top.toString() + 'px)';
        frame.transform = 'translateX(0) translateY(0)';
    }

    if (position === positionEnd) {
        let target = document.getElementById(options.targetId);
        document.moveToTarget[element.id] = {}
        document.moveToTarget[element.id]['target'] = target.id
        let targetRect = target.getBoundingClientRect();
        console.log("-> moveToTarget targetRect", targetRect);

        let widthOffset = 0, heightOffset = 0, leftOffset = 0, topOffset = 0;
        if(options.widthOffset)
            leftOffset = parseFloat(options.widthOffset)/2;

        if(options.heightOffset)
            topOffset = parseFloat(options.heightOffset)/2;

        if (section === sectionFull || section === sectionSecondHalf) {
            frame.transform = 'translateX(' + (targetRect.left - leftOffset - rect.left).toString() + 'px) translateY(' + (targetRect.top - topOffset - rect.top).toString() + 'px)';
            document.moveToTarget[element.id]['left'] = (targetRect.left - leftOffset).toString() + 'px';
            document.moveToTarget[element.id]['top'] = (targetRect.top - topOffset).toString() + 'px';
            console.log("-> getMoveToTargetFrame calculation (", targetRect.left , " - ", leftOffset, ").toString()");
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

export function getFillColorFromLeftFrame(element, position, section, options = {}) {
    let frame = {};

    if (position === positionStart) {
        frame['background'] = "linear-gradient(to right, blue 0%, gray 0%)";
        frame['background-position'] = "left";
        frame['transform'] = "scale(0)"
    }

    if (position === positionEnd) {
        if (section === sectionFull || section === sectionSecondHalf) {
            frame['background'] = "linear-gradient(to right, blue 1000%, gray 100%)";
            frame['background-position'] = "left";
            frame['transform'] = "scale(1)"
        }


        if (section === sectionFirstHalf) {
            frame['background'] = "linear-gradient(to right, blue 50%, gray 50%)";
            frame['background-position'] = "left";
            frame['transform'] = "scale(0.5)"
        }
    }

    return frame;
}

export function getResizeWidthFrame(element, position, section, options = {}) {
    let frame = {};
    let rect = element.getBoundingClientRect();

    if (position === positionStart) {
        if (options.startWidth && section === sectionFirstHalf)
            frame['width'] = options.startWidth;
        else if (options.startWidth && options.endWidth && section === sectionSecondHalf)
            frame['width'] = midpoint(options.startWidth, options.endWidth);
        else
            frame['width'] = rect.width;
    }

    if (position === positionEnd) {
        if (section === sectionFull || section === sectionSecondHalf) {
            frame['width'] = options.endWidth;
        }

        if (section === sectionFirstHalf) {
            frame['width'] = midpoint(options.startWidth, options.endWidth);
        }
    }

    return frame;

}

export function getChangeColorFrame(element, position, section, options = {}) {
    let frame = {}, property, startColor, endColor = options.endColor;

    !!options.property ? property = options.property : property = 'background';
    !!options.startColor ? startColor = options.startColor : startColor = window.getComputedStyle(element).getPropertyValue(property);

    console.log("-> getChangeColorFrame options", options);
    console.log("-> getChangeColorFrame startColor", startColor, " endColor", endColor);

    if (isCssVariable(startColor))
        startColor = getCssVariableColor(startColor);

    if (isCssVariable(endColor))
        endColor = getCssVariableColor(endColor);

    console.log("-> getChangeColorFrame after getCssVariableColor startColor", startColor);
    console.log("-> getChangeColorFrame after getCssVariableColor endColor", endColor);



    if (position === positionStart) {
        if (section === sectionFull || section === sectionFirstHalf) {
            frame[hyphenatedToCamelCase(property)] = startColor;
            console.log("-> frame[hyphenatedToCamelCase(property)]", frame[hyphenatedToCamelCase(property)]);
        }
        else {
            frame[hyphenatedToCamelCase(property)] = midpointColor(startColor, endColor);
            console.log("-> frame[hyphenatedToCamelCase(property)]", frame[hyphenatedToCamelCase(property)]);
        }

    }

    if (position === positionEnd) {
        if (section === sectionFull || section === sectionSecondHalf) {
            frame[hyphenatedToCamelCase(property)] = endColor;
            console.log("-> frame[hyphenatedToCamelCase(property)]", frame[hyphenatedToCamelCase(property)]);
        }

        if (section === sectionFirstHalf) {
            frame[hyphenatedToCamelCase(property)] = midpointColor(startColor, endColor);
            console.log("-> frame[hyphenatedToCamelCase(property)]", frame[hyphenatedToCamelCase(property)]);
        }

    }

    console.log("-> getChangeColorFrame frame", frame);
    return frame;
}
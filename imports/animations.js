import {
    positionEnd,
    positionStart,
    propertiesDelimiter,
    sectionFirstHalf,
    sectionFull,
    sectionSecondHalf
} from "./constants";
import {
    convertToRGB, getAlpha,
    getCssVariableColor, getPropertyColor,
    hyphenatedToCamelCase,
    isCssVariable, isRGBA,
    midpoint,
    midpointColor, rgbToRgba
} from "./helper-functions";

export function getExitToLeftFrame(element, position, section, options = {}) {
    let frame = {};
    let rect = element.getBoundingClientRect();

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

    return frame;
}

export function getExitToRightFrame(element, position, section, options = {}) {
    let frame = {};
    let rect = element.getBoundingClientRect();

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

    return frame;
}

export function getEnterFromRightFrame(element, position, section, options = {}) {
    let frame = {};
    let rect = element.getBoundingClientRect();

    if (position === positionStart) {
        if (section === sectionFull || section === sectionSecondHalf)
            frame['transform'] = 'translateX(' + (window.innerWidth - rect.left).toString() + 'px)';

        if (section === sectionFirstHalf)
            frame['transform'] = 'translateX(' + ((window.innerWidth - rect.left) / 2).toString() + 'px)';
    }

    if (position === positionEnd) {
        frame.transform = 'translateX(0) translateY(0)';
    }

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

    if (position === positionStart) {
        //frame.transform = 'translateX(' + rect.left.toString() + 'px) translateY(' + rect.top.toString() + 'px)';
        frame.transform = 'translateX(0) translateY(0)';
    }

    if (position === positionEnd) {
        let target = document.getElementById(options.targetId);
        document.moveToTarget[element.id] = {}
        document.moveToTarget[element.id]['target'] = target.id
        let targetRect = target.getBoundingClientRect();

        let widthOffset = 0, heightOffset = 0, leftOffset = 0, topOffset = 0;
        if(options.widthOffset)
            leftOffset = parseFloat(options.widthOffset)/2;

        if(options.heightOffset)
            topOffset = parseFloat(options.heightOffset)/2;

        if (section === sectionFull || section === sectionSecondHalf) {
            frame.transform = 'translateX(' + (targetRect.left - leftOffset - rect.left).toString() + 'px) translateY(' + (targetRect.top - topOffset - rect.top).toString() + 'px)';
            document.moveToTarget[element.id]['left'] = (targetRect.left - leftOffset).toString() + 'px';
            document.moveToTarget[element.id]['top'] = (targetRect.top - topOffset).toString() + 'px';
        }

        if (section === sectionFirstHalf)
            frame.transform = 'translateX(' + ((targetRect.left - leftOffset - rect.left)/2).toString() + 'px) translateY(' + ((targetRect.top - topOffset - rect.top)/2).toString() + 'px)';
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
    let frame = {}, properties = options.properties.split(propertiesDelimiter), startColors = [], endColors = [];

    for (const propertiesIndex in properties) {
        let startColor, endColor, property = properties[propertiesIndex];

        !!options.startColors ? startColors = options.startColors.split(propertiesDelimiter) : startColors.push(getPropertyColor(element, property));
        !!options.endColors ? endColors = options.endColors.split(propertiesDelimiter) : endColors.push(getPropertyColor(element, property));

        startColor = startColors[propertiesIndex];
        endColor = endColors[propertiesIndex];

        if (isCssVariable(startColor))
            startColor = getCssVariableColor(startColor);

        if (isCssVariable(endColor))
            endColor = getCssVariableColor(endColor);

        if (position === positionStart) {
            frame[hyphenatedToCamelCase(property)] = startColor;
        }

        if (position === positionEnd) {
            if (section === sectionFull || section === sectionSecondHalf)
                frame[hyphenatedToCamelCase(property)] = endColor;
            if (section === sectionFirstHalf)
                frame[hyphenatedToCamelCase(property)] = midpointColor(startColor, endColor);
        }
    }

    return frame;
}

export function getMakeColorTransparentFrame(element, position, section, options = {}) {
    let frame = {}, properties = options.properties.split(propertiesDelimiter), startColors = [], endColors = [];
    for (const propertiesIndex in properties) {
        let startColor, endColor, midColor, startAlpha, midAlpha, property = properties[propertiesIndex];

        !!options.startColors ? startColors = options.startColors.split(propertiesDelimiter) : startColors.push(getPropertyColor(element, property));
        !!options.endColors ? endColors = options.endColors.split(propertiesDelimiter) : endColors.push(getPropertyColor(element, property));

        startColor = startColors[propertiesIndex];
        endColor = endColors[propertiesIndex];

        if (isCssVariable(startColor))
            startColor = getCssVariableColor(startColor);

        if (isCssVariable(endColor))
            endColor = getCssVariableColor(endColor);

        if (!isRGBA(startColor)){
            startColor = convertToRGB(startColor);
            startColor = `rgb(${startColor.red}, ${startColor.green}, ${startColor.blue})`;
            startColor = rgbToRgba(startColor, 1);
        }

        startAlpha = getAlpha(startColor);
        midAlpha = startAlpha/2;

        endColor = convertToRGB(endColor);
        endColor = `rgb(${endColor.red}, ${endColor.green}, ${endColor.blue})`;
        endColor = rgbToRgba(endColor, 0);

        midColor = midpointColor(startColor, endColor);
        midColor = rgbToRgba(midColor, midAlpha);


        if (position === positionStart) {
            if (section === sectionFirstHalf)
                frame[hyphenatedToCamelCase(property)] = startColor;
            else
                frame[hyphenatedToCamelCase(property)] = midColor;
        }

        if (position === positionEnd) {
            if (section === sectionFull || section === sectionSecondHalf)
                frame[hyphenatedToCamelCase(property)] = endColor;
            if (section === sectionFirstHalf)
                frame[hyphenatedToCamelCase(property)] = midColor;
        }

    }

    return frame;
}
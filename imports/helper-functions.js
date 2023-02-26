import {positionEnd, positionStart, sectionFirstHalf, sectionFull, sectionSecondHalf} from "./constants";

export function storeItem(itemName, itemData)
{
    document.cookie = itemName + '=' + itemData + '; Path=/; SameSite=strict;';
}

export function fetchItem(itemName)
{
    return document.cookie
        .split('; ')
        .find((row) => row.startsWith(itemName+'='))
        ?.split('=')[1];
}

export function capitalizeFirstLetter(stringValue) {
    return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
}

export function isAlphanumeric(string) {
    let alphanumericRegEx = /^[0-9a-zA-Z]+$/;
    return !!string.match(alphanumericRegEx);
}

export function getExitToLeftFrame(element, position, section, options = []) {
    let frame = {};
    let rect = element.getBoundingClientRect();

    if (position === positionStart) {
        // Get element's current position
        frame['transform'] = 'translateX(' + rect.left.toString() + 'px' + ')';
    }

    if (position === positionEnd) {
        if (section === sectionFull || section === sectionSecondHalf)
            frame['transform'] = 'translateX(-' + rect.right.toString() + ')';

        if (section === sectionFirstHalf)
            frame['transform'] = 'translateX(-' + (rect.right / 2).toString() + ')';
    }

    return frame;
}

export function getFadeoutFrame(element, position, section, options = []) {
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
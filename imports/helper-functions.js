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

export function capitalizeFirstLetter(str) {
    if (typeof str !== "string") {
        return "";
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isAlphanumeric(string) {
    let alphanumericRegEx = /^[0-9a-zA-Z]+$/;
    return !!string.match(alphanumericRegEx);
}

export function getUnit(str) {
    if (typeof str !== "string") {
        return "";
    }
    if (str.endsWith("px")) {
        return "px";
    } else if (str.endsWith("%")) {
        return "%";
    } else if (str.endsWith("pt")) {
        return "pt";
    } else if (str.endsWith("em")) {
        return "em";
    } else {
        return "";
    }
}

export function midpoint(num1, num2) {
    return (parseFloat(num1) + parseFloat(num2)) / 2;
}


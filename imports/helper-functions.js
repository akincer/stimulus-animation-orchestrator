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

export function midpoint(num1, num2) {
    if (typeof num1 === "string")
        return ((parseFloat(num1) + parseFloat(num2)) / 2).toString() + getUnit(num1);

    if (typeof num1 === "number" || typeof num1 === "bigint")
        return num1 + num2;

    return NaN;
}

export function getUnit(str) {
    // Find the index of the first non-digit character
    const start = str.search(/\D/);

    // If no non-digit characters are found, return an empty string
    if (start === -1) {
        return "";
    }

    const end = str.length

    // Return the text portion of the string
    return str.slice(start, end);
}
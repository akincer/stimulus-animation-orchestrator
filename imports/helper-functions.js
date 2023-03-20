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

export function isCssVariable(str) {
    return typeof str === "string" && str.trim().startsWith("--") && str.trim().length > 2;
}

export function getCssVariableColor(variableName) {
    // Get the computed value of the CSS variable
    const computedValue = getComputedStyle(document.body).getPropertyValue(variableName).trim();

    // Check if the computed value is a color value
    if (/^#[0-9A-F]{6}$/i.test(computedValue) || /^#[0-9A-F]{3}$/i.test(computedValue) || /^rgba?\(.+\)$/i.test(computedValue) || /^hsla?\(.+\)$/i.test(computedValue)) {
        return computedValue;
    } else {
        return null; // The computed value is not a valid color value
    }
}

export function calculateMidpointColor(color1, color2) {
    let color1normalized = color1, color2normalized = color2;

    if (isCssVariable(color1))
        color1normalized = getCssVariableColor(color1)

    if (isCssVariable(color2))
        color2normalized = getCssVariableColor(color2)

    console.log("-> color1", color1, ' color2', color2);
    console.log("-> color1normalized", color1normalized, 'color2normalized', color2normalized);

    // Extract the color format and components for color1
    const color1Format = color1normalized.substring(0, 3);
    const color1Components = color1normalized.substring(3).match(/[A-Za-z0-9]{2}/g).map(val => parseInt(val, 16));

    // Extract the color format and components for color2
    const color2Format = color2normalized.substring(0, 3);
    const color2Components = color2normalized.substring(3).match(/[A-Za-z0-9]{2}/g).map(val => parseInt(val, 16));

    // Calculate the midpoint between the components
    const midpointComponents = color1Components.map((val, index) => Math.round((val + color2Components[index]) / 2));

    // Construct the midpoint color in the original format
    let midpointColor = color1Format;
    midpointComponents.forEach(component => midpointColor += component.toString(16).toUpperCase().padStart(2, '0'));

    return midpointColor;
}
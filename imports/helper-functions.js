import {off, positionEnd, positionStart, sectionFirstHalf, sectionFull, sectionSecondHalf} from "./constants";

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
    let computedValue = getComputedStyle(document.body).getPropertyValue(variableName).trim();

    console.log("-> computedValue BEFORE", computedValue);
    if (isRgb(computedValue))
        computedValue = 'rgb(' + computedValue + ')';

    if (isRgba(computedValue))
        computedValue = 'rgba(' + computedValue + ')';
    console.log("-> computedValue AFTER", computedValue);

    // Check if the computed value is a color value
    if (/^#[0-9A-F]{6}$/i.test(computedValue) || /^#[0-9A-F]{3}$/i.test(computedValue) || /^rgb?\(.+\)$/i.test(computedValue) || /^rgba?\(.+\)$/i.test(computedValue) || /^hsla?\(.+\)$/i.test(computedValue)) {
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

export function isRgb(str) {
    return /^\d+,\s?\d+,\s?\d+$/i.test(str);
}

export function isRgba(str) {
    return /^\d+,\s?\d+,\s?\d+,\s?\d+$/i.test(str);
}

export function convertToRGB(color) {
    if (color.startsWith('#')) {
        const hex = color.substring(1);
        const red = parseInt(hex.substring(0, 2), 16);
        const green = parseInt(hex.substring(2, 4), 16);
        const blue = parseInt(hex.substring(4, 6), 16);
        return { red, green, blue };
    } else if (color.startsWith('rgb')) {
        const values = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(',');
        return {
            red: parseInt(values[0]),
            green: parseInt(values[1]),
            blue: parseInt(values[2]),
        };
    } else if (color.startsWith('hsl')) {
        const hslToRgb = (h, s, l) => {
            const hueToRgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            h /= 360;
            s /= 100;
            l /= 100;

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            return {
                red: Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
                green: Math.round(hueToRgb(p, q, h) * 255),
                blue: Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
            };
        };

        const values = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(',');
        return hslToRgb(parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]));
    } else {
        throw new Error('Unsupported color format');
    }
}

export function midpointColor(color1, color2) {
    const color1RGB = convertToRGB(color1);
    const color2RGB = convertToRGB(color2);

    const midpointRGB = {
        red: Math.round((color1RGB.red + color2RGB.red) / 2),
        green: Math.round((color1RGB.green + color2RGB.green) / 2),
        blue: Math.round((color1RGB.blue + color2RGB.blue) / 2),
    };

    return `rgb(${midpointRGB.red}, ${midpointRGB.green}, ${midpointRGB.blue})`;
}

export function hyphenatedToCamelCase(str) {
    return str.replace(/-./g, match => match.charAt(1).toUpperCase());
}

export function isRGBA(str) {
    const rgbaRegex = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*([\d.]+)\)$/i;
    const match = str.match(rgbaRegex);

    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = parseFloat(match[4]);

        return (
            r >= 0 && r <= 255 &&
            g >= 0 && g <= 255 &&
            b >= 0 && b <= 255 &&
            a >= 0 && a <= 1
        );
    }

    return false;
}

export function isTransparent(rgbaColor) {
    const rgbaRegex = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*([\d.]+)\)$/i;
    const match = rgbaColor.match(rgbaRegex);

    if (match) {
        const alpha = parseFloat(match[4]);
        return alpha === 0;
    }

    throw new Error('Invalid RGBA color format');
}

export function getPropertyColor(element, property) {
    let currentElement = element;

    if (!isRGBA(window.getComputedStyle(element).getPropertyValue(property)) || !isTransparent(window.getComputedStyle(element).getPropertyValue(property))) {
        return window.getComputedStyle(element).getPropertyValue(property);
    } else {
        while (!!currentElement.parentElement && isRGBA(window.getComputedStyle(currentElement).getPropertyValue(property)) && isTransparent(window.getComputedStyle(currentElement).getPropertyValue(property))) {
            currentElement = currentElement.parentElement;
        }
        if (!isRGBA(window.getComputedStyle(currentElement).getPropertyValue(property)) || !isTransparent(window.getComputedStyle(currentElement).getPropertyValue(property)))
            return window.getComputedStyle(currentElement).getPropertyValue(property);
        return document.orchestrator.defaults.color

    }
}

export function toggleClass(element, cssClass, state) {
    state === off ? element.classList.remove(cssClass) : element.classList.add(cssClass);
}

export function rgbToRgba(rgbColor, alpha = 1) {
    const rgbRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i;
    const match = rgbColor.match(rgbRegex);

    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    throw new Error('Invalid RGB color format');
}

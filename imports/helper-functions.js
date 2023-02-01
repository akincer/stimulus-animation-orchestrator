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
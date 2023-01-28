export function storeItem(itemName, itemData)
{
    document.cookie = itemName + '=' + itemData + '; Path=/; SameSite=strict;';
}

export function capitalizeFirstLetter(stringValue) {
    return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
}
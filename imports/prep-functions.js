import {schedulePostNextPageRender, schedulePreNextPageRender} from "./constants";

export function doFadeInPrep(element, subscription) {
    console.log("-> prepwork doFadeInPrep element", element);
    console.log("-> prepwork doFadeInPrep subscription", subscription);
    if (subscription.schedule === schedulePostNextPageRender)
        element.style.opacity = "0";

    if (subscription.schedule === schedulePreNextPageRender)
        element.style.opacity = "1";
}

export function doFadeoutPrep(element, subscription) {
    console.log("-> prepwork doFadeoutPrep element", element);
    console.log("-> prepwork doFadeoutPrep subscription", subscription);
    if (subscription.schedule === schedulePostNextPageRender)
        element.style.opacity = "1";

    if (subscription.schedule === schedulePreNextPageRender)
        element.style.opacity = "0";
}
import {schedulePostNextPageRender, schedulePreNextPageRender} from "./constants";

export function doFadeInPrep(element, subscription) {
    if (subscription.schedule === schedulePostNextPageRender)
        element.style.opacity = "0";

    if (subscription.schedule === schedulePreNextPageRender)
        element.style.opacity = "1";
}

export function doFadeoutPrep(element, subscription) {
    if (subscription.schedule === schedulePostNextPageRender)
        element.style.opacity = "1";

    if (subscription.schedule === schedulePreNextPageRender)
        element.style.opacity = "0";
}
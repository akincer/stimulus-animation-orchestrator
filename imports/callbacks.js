export const popStateCallback = function (event) {

}

export const turboClickCallback = function (event) {

}

export const turboBeforeVisitCallback = function (event) {

}

export const turboVisitCallback = function (event) {

}

export const turboSubmitStartCallback = function (event) {

}

export const turboBeforeFetchRequestCallback = function (event) {

}

export const turboBeforeFetchResponseCallback = function (event) {

}

export const turboSubmitEndCallback = function (event) {

}

export const turboBeforeCacheCallback = function (event) {

}

export const turboBeforeRenderCallback = async function (event) {
    console.log('turboBeforeRenderCallback')
    console.log(event)
    let thisPageTarget = document.getElementById('test')
    let nextPageTarget = event.detail.newBody.querySelector("#test")
    console.log("-> thisPageTarget", thisPageTarget);
    console.log("-> nextPageTarget", nextPageTarget);
}

export const turboBeforeStreamRenderCallback = function (event) {

}

export const turboRenderCallback = function (event) {
    console.log('turboRenderCallback')
    console.log(event)
}

export const turboLoadCallback = function (event) {

}

export const turboFrameRenderCallback = function (event) {

}

export const turboFrameLoadCallback = function (event) {

}

export const turboFetchRequestErrorCallback = function (event) {

}
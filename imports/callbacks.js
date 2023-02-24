import {fetchItem, storeItem} from "./helper-functions";

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
    console.log('turboBeforeRenderCallback');
    console.log(event);
    let thisPageTarget = document.getElementById('test');
    let boxBefore = thisPageTarget.getBoundingClientRect();
    let nextPageTarget = event.detail.newBody.querySelector("#test");
    let nextBoxBefore = nextPageTarget.getBoundingClientRect();
    //console.log("-> thisPageTarget", thisPageTarget);
    // Get current coordinates for thisPageTarget

    // Pause rendering
    event.preventDefault();

    // Move a certain amount (example from MDN White Rabbit)
    const testKeyframes = new KeyframeEffect(
        thisPageTarget, // element to animate
        [
            { transform: 'translateX(0)' }, // keyframe start
            { transform: 'translateX(50px)' } // keyframe finish
        ],
        { duration: 500, fill: 'forwards' } // keyframe options
    );

    const testAnimation = new Animation(testKeyframes, document.timeline);

    // Play animation
    testAnimation.play();

    await testAnimation.finished

    // Get new coordinates of thisPageTarget
    let boxAfter = thisPageTarget.getBoundingClientRect();

    // Set nextPageTarget to match these coordinates
    console.log("-> event.detail.newBody BEFORE setting left", event.detail.newBody);
    console.log("-> nextPageTarget BEFORE setting left", nextPageTarget);
    let newLeft = boxAfter.x - 32;
    nextPageTarget.style.left = newLeft + 'px';
    storeItem('newLeft', boxAfter.x + 'px');
    console.log("-> nextPageTarget AFTER setting left", nextPageTarget);
    console.log("-> event.detail.newBody AFTER setting left", event.detail.newBody);
    let nextBoxAfter = nextPageTarget.getBoundingClientRect();

    console.log("-> boxBefore", boxBefore);
    console.log("-> boxAfter", boxAfter);
    console.log("-> nextBoxBefore", nextBoxBefore);
    console.log("-> nextBoxAfter", nextBoxAfter);

    // Resume rendering
    event.detail.resume();
}

export const turboBeforeStreamRenderCallback = function (event) {

}

export const turboRenderCallback = async function (event) {
    console.log('turboRenderCallback')
    console.log(event)

    let newLeft = fetchItem('newLeft');
    let newDistance = parseInt(newLeft) + 50;

    // Move the element further
    let thisPageTarget = document.getElementById('test');
    //thisPageTarget.left = newLeft;
    let boxBefore = thisPageTarget.getBoundingClientRect();
    console.log("-> boxBefore", boxBefore);
    const testKeyframes = new KeyframeEffect(
        thisPageTarget, // element to animate
        [
            { transform: 'translateX(' + newLeft + ')' }, // keyframe start
            { transform: 'translateX(' + newDistance + 'px' + ')' } // keyframe finish
        ],
        { duration: 500, fill: 'forwards' } // keyframe options
    );

    const testAnimation = new Animation(testKeyframes, document.timeline);

    // Play animation
    testAnimation.play();
    await testAnimation.finished;
    let afterBox = thisPageTarget.getBoundingClientRect();
    console.log("-> afterBox", afterBox);
}

export const turboLoadCallback = function (event) {

}

export const turboFrameRenderCallback = function (event) {

}

export const turboFrameLoadCallback = function (event) {

}

export const turboFetchRequestErrorCallback = function (event) {

}
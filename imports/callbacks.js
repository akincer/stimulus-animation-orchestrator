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
    let nextPageTarget = event.detail.newBody.querySelector("#test");
    console.log("-> thisPageTarget", thisPageTarget);
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
    let box = thisPageTarget.getBoundingClientRect();

    // Set nextPageTarget to match these coordinates
    nextPageTarget.style.left = box.left

    console.log("-> nextPageTarget", nextPageTarget);

    // Resume rendering
    event.detail.resume();
}

export const turboBeforeStreamRenderCallback = function (event) {

}

export const turboRenderCallback = function (event) {
    console.log('turboRenderCallback')
    console.log(event)

    // Move the element further
    let thisPageTarget = document.getElementById('test');
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
}

export const turboLoadCallback = function (event) {

}

export const turboFrameRenderCallback = function (event) {

}

export const turboFrameLoadCallback = function (event) {

}

export const turboFetchRequestErrorCallback = function (event) {

}
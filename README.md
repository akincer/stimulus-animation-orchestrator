# stimulus-animation-orchestrator

Animation Orchestrator provides an interface to perform basic animations immediately, that can span seamlessly across page visits or pause rendering to allow an animation to complete before loading the next page. The goal is get SPA experience with animations using Stimulus and Turbo.

# Architecture

One of the primary goals of Animation Orchestrator is to put the design of your animations closer to your templates and out of your CSS by leveraging the power of Web Animations API.

For the moment the animations available are single step oriented. You can configure multiple animations to run at the same time. Defining multiple animations steps not yet supported.

# Getting Started

This package was developed using Stimulus 3.1.0 and Turbo 7.1.0. It has not been tested against older versions. At a minimum, you will need a Turbo version that supports pausable rendering with the before-render event.

It's possible you could use this with just Stimulus but only immediate animations would work.

### Using yarn

```
yarn add @akincer/stimulus-animation-orchestrator
```

# Using Orchestrator

Create a controller in your controller repository folder and import Orchestrator. Name it whatever you want but for these examples we'll use animation_orchestrator_controller.js. Call the parent connect method in the connect method and set your config preferences.

**Note: for orchestrator to work correctly you must disable Turbo caching.**

```
import Orchestrator from '@akincer/stimulus-animation-orchestrator'

export default class extends Orchestrator {
    connect() {
        super.connect();

        // Config settings
    }
}
```

### Loading Orchestrator

Load the controller on your html element and assign your html element an ID. 

**NOTE: All elements used with Orchestrator must have a unique ID.**
```
<html
    id="htmlRoot"
    data-controller="animation-orchestrator"
```

### Default Animation

Out of the box the default animation sequence is fadeIn and fadeOut. This is most effectively set on the element that holds your content. If you're using a templating engine such as Twig it's easiest to set it in your base.html.twig file. Use the data attribute **data-orchestrator-default** to configure an element to accept the default animation.

```
    <main
        data-orchestrator-default
        id="main"
    >
    {% block body %}
    {% endblock %}
    </main>
```

### Triggering Animations

```
<button
    id="myButton"
    data-action="click->animation-orchestrator#orchestrateSubscribedAnimations"
```

### Animation Subscriptions

Animations are orchestrated via subscriptions. A subscriber is an element that has a defined subscription for an event on any element in the DOM.

The syntax for a subscriptions is:

```
setting1->value:setting2->value
```

Some settings values might have additional data. For example options.

```
options->startWidth=0%||endWidth=100%
```

#### Example Subscription

This subscription causes the subscriber to exit off the screen to the left and fade out at the same time.

```
<div
    id="myDiv"
    data-inline-animation-subscriptions="
        source->myButton:event->click:animation->exitToLeft:schedule->pre:direction->forwards:duration->300
        source->myButton:event->click:animation->fadeOut:schedule->pre:direction->forwards:duration->300
    "
```

# Configuration and Settings Reference

### Defaults 

Defaults can be set two ways. You can set them in your controller instance after running super.connect() or you can set them in data attributes in your &lt;html> tag.

| Data Attribute                               | Config Setting                               | Description                                                               | Preset           | MDN                                                                                          |
|----------------------------------------------|----------------------------------------------|---------------------------------------------------------------------------|------------------|----------------------------------------------------------------------------------------------|
| data-orchestrator-default-animation-duration | document.orchestrator.defaults.duration      | Time the animation takes to complete. Must be an integer.                 | 600              | [:information_source:](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration)  |
| data-orchestrator-default-fill-direction     | document.orchestrator.defaults.fillDirection | Defines how styles are applied during the animation life cycle.           | forwards         | [:information_source:](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode) |
| data-orchestrator-default-easing             | document.orchestrator.defaults.easing        | Default rate of change of an animation.                                   | forwards         | [:information_source:](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function)     |
| data-orchestrator-default-pre-animation      | document.orchestrator.defaults.preAnimation  | Default animation played during a visit before the next page renders      | fadeOut          |                                                                                              |
| data-orchestrator-default-post-animation     | document.orchestrator.defaults.postAnimation | Default animation played during a visit after the next page renders       | fadeIn           |                                                                                              |
| data-orchestrator-default-color              | document.orchestrator.defaults.color         | Default color used when the element's color is imlied and it has no color | rgb(255,255,255) |                                                                                              |

# Settings

| Name      | Description                                            | Requirement |
|-----------|--------------------------------------------------------|-------------|
| source    | The source id of the event the subscriber is accepting | Required    |
| event     | The event the subscriber is accepting                  | Required    |
| animation | The animation to be played in the subscription         | Required    |
| schedule  | When the animation will be played                      | Required    |
| direction | The fill mode direction                                | Optional    |
| duration  | Time given for the animation to complete               | Optional    |
| easing    | The rate of change of an animation                     | Optional    |
| options   | Additional configuration parameters for animations     | Optional    |

# Animations

| Name                 | Element Effect                                                                    |
|----------------------|-----------------------------------------------------------------------------------|
| exitToLeft           | Exits the left side of the screen from its current location                       |
| exitToRight          | Exits the right side of the screen from its current location                      |
| enterFromRight       | Enters the screen from the right to its rendered location                         |
| enterFromLeft        | Enters the screen from the left to its rendered location                          |
| fadeOut              | Fades out to complete transparency                                                |
| fadeIn               | Fades in from complete transparency to complete opacity                           |
| moveToTarget         | Moves to the coordinates of the named target                                      |
| resizeWidth          | Resizes width from start to end values                                            |
| changeColor          | Changes the color of specified style properties from start to end colors          |
| makeColorTransparent | Changes the opacity of specified style properties from start to fully transparent |

# Schedules

| Name      | Timing                                                    | Notes                                                             |
|-----------|-----------------------------------------------------------|-------------------------------------------------------------------|
| immediate | Immediately upon the subscribed event firing              | Only use for animations that don't involve a submit or visit      |
| now       | Alias of immediate                                        |                                                                   |
| complete  | Before the next page is rendered during a visit           | Allows the animation to complete before the next page is rendered |
| pre       | Alias of complete                                         |                                                                   |
| post      | After the next page is rendered during a visit            | Requires the subscriber exist on the next page                    |
| span      | Split evenly before and after the next page is rendered   | Requires the subscriber exist on the next page                    |

# Options

The syntax for options is:

```
options->optionName1=value1;value2;value3||optionName2=value1;value2;value3
```

Note if you have options that correspond to each other you need to keep them in order.

```
options->properties=background-color;border-color||endColors=--my-primary-background-color;--my-primary-border-color
```

| Name         | Animations                        | Values                                                             | MDN                                                                                              |
|--------------|-----------------------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| properties   | changeColor, makeColorTransparent | Animatable color properties                                        | [:information_source:](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties) |
| startColors  | changeColor, makeColorTransparent | Any valid CSS color                                                | [:information_source:](https://developer.mozilla.org/en-US/docs/Web/CSS/color)                   |
| endColors    | changeColor, makeColorTransparent | Any valid CSS color                                                | [:information_source:](https://developer.mozilla.org/en-US/docs/Web/CSS/color)                   |
| targetId     | moveToTarget                      | Id of target element                                               |                                                                                                  |
| widthOffset  | moveToTarget                      | Offset of width in pixels to set on subscriber compared to target  |                                                                                                  |
| heightOffset | moveToTarget                      | Offset of height in pixels to set on subscriber compared to target |                                                                                                  |
| startWidth   | resizeWidth                       | Any valid CSS width (% recommended)                                | [:information_source:](https://developer.mozilla.org/en-US/docs/Web/CSS/width)                   |
| endWidth     | resizeWidth                       | Any valid CSS width (% recommended)                                | [:information_source:](https://developer.mozilla.org/en-US/docs/Web/CSS/width)                   |
# stimulus-animation-orchestrator

Animation Orchestrator provides an interface to perform basic animations immediately, that can span seamlessly across page visits or pause rendering to allow an animation to complete before loading the next page. The goal is get SPA experience with animations using Stimulus and Turbo.

# Getting Started

This package was developed using Stimulus 3.1.0 and Turbo 7.1.0. It has not been tested against older versions. At a minimum, you will need a Turbo version that supports pausable rendering with he before-render event.

It's possible you could use this with just Stimulus but only immediate animations would work.

### Using yarn

```
yarn add @akincer/stimulus-animation-orchestrator
```

# Animation Types

| Type      | Description                                                                                                                                                        |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| default   | Default animation that plays between page visits - usually fadeOut / fadeIn. During spans the default is overridden.                                               |
| immediate | Immediately executed once triggered. If used with a submit or link it's unlikely the animation will finish before page load.                                       |
| pre       | Plays before rendering of the next page. An alias for complete.                                                                                                    |
| post      | Plays just after rendering of the next page.                                                                                                                       |
| complete  | Pauses rendering and allows an animation on the current page to finish.                                                                                            |
| span      | Splits an animation in half between the current page in the next page. Requires the element being animated to exist on the next page or it falls back to complete. |

# Using Orchestrator

Create a controller in your controller repository folder and import Orchestrator. Name it whatever you want but for these examples we'll use animation_orchestrator_controller.js. Call the parent connect method in the connect method and set your config preferences.

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
    data-inline-animation-subscriptions="
        source->myButton:event->click:animation->exitToLeft:schedule->pre:direction->forwards:duration->300
        source->myButton:event->click:animation->fadeOut:schedule->pre:direction->forwards:duration->300
    "
```
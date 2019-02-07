---
title: Auto-Hiding Sticky Headers with RxJS and React Hooks
description: Use RxJS and React hooks to create a performant sticky header that hides on scroll for your React app.
featuredImage: ./react-rxjs.png
date: '2019-01-30T22:12:03.284Z'
tags: ['React', 'RxJS', 'React Hooks']
published: true
---

Using a fixed header in your website or app provides a simple, recognizable way for users to navigate. The only problem is: they take up valuable real estate on mobile devices. If you only have a couple hundred pixels to work with, using 50 to 60 of them for navigation that a user _might_ need that covers up your content doesn't make much sense. One solution is to hide your navigation header when the user likely doesn't want it, such as when they are scrolling down through your content. Then make your navigation available when they indicate that they might be looking for it, such as by scrolling up. Sites such as [Medium](https://medium.com/netflix-techblog) have helped to popularize this particular UI pattern.

Generally, this approach requires 4 things:

1. You need to listen for scroll events.
2. You need to store the most recent scroll position.
3. You need to compare the current scroll position to the previous one to determine the scoll direction.
4. You need to animate your header based on the scroll direction.

There are libraries (such as <a href="https://github.com/KyleAMathews/react-headroom" target="_blank">`react-headroom`</a>) that can take care of this for you. But, if you're already taking advantage of RxJS in your React app (which you should really try out if you haven't), you can skip the extra dependency, have a little more control, and be able to brag to your friends about all the fancy Observables your app uses.

You can set this up with any combination of React classes, the Context API, Redux and probably a hundred other concepts. But, it's 2019 and we're doing Hooks now so that's what we'll use here. As of this writing, you'll need to use at least the 16.8.0 versions of React and React-DOM to take advantage of Hooks. You can do that by running this command in your project:

```sh
npm install --save react@16.8.0 react-dom@16.8.0
```

By the time you read this, you may not need to use an alpha according to this tweet:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">React Hooks ship next week 😁<br><br>And I&#39;ll have a pretty exciting announcement myself next week 🤗<a href="https://t.co/EkLZbzghML">https://t.co/EkLZbzghML</a></p>&mdash; Ryan Florence (@ryanflorence) <a href="https://twitter.com/ryanflorence/status/1090350486480289792?ref_src=twsrc%5Etfw">January 29, 2019</a></blockquote>

Now, we just need to add RxJS to our app. Luckily, there is also a <a href="https://www.npmjs.com/package/rxjs-hooks" target="_blank">`rxjs-hooks`</a> library we can use to make consuming our observables a little easier. To add those to your app, run the following command in your project;

```sh
npm install --save rxjs rxjs-hooks
```

Finally, for the sake of making our animations silky smooth, our example will use the <a href="https://www.npmjs.com/package/@material/animation" target="_blank">`@material/animation`</a> package and <a href="https://sass-lang.com/" target="_blank">Sass CSS extensions</a>. But, you could certainly skip these and define your animations how you see fit. If you want to use this library, run the following command in your project:

```sh
npm install --save @material/animation node-sass
```

Now that we have all our dependencies out of the way, let's scaffold out our app with some tall sections in the main content so we can test out our header:

```tsx
import React from 'react'
import ReactDOM from 'react-dom'

function App() {
  return (
    <article className="App">
      <header className={`site-header`}>
        <span>Header</span>
      </header>
      <main>
        {['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'].map(
          (color, i) => (
            <section key={`${color}-${i}`} style={{ color: color }}>
              <span>section</span>
            </section>
          )
        )}
      </main>
    </article>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
```

Now, let's talk about RxJS and how we can make this all work. This method is heavily influenced by [this article by Tomasz Kula](https://netbasal.com/reactive-sticky-header-in-angular-12dbffb3f1d3) about sticky headers in Angular. We need to watch for window scroll events and fire events. First, we'll need to make sure that we're only operating on the client side. If you're using server-side rendering or a static site generator (such as [Gatsby](https://www.gatsbyjs.org/)), subscribing to window events will break your app. We could wrap everything in an `if` statement. But, that can get complicated if we have multiple properties using our Observable or if we want to share the Observable across components.

So, let's check right in the function using `of`:

```typescript
const watchScroll: Observable<number> = of(typeof window !== 'undefined')
```

This will let us first check that we're in a client context before we do anything else. We also need to make sure that, if we're on the server, we don't go any further. So, let's use the `filter` operator:

```typescript
const watchScroll: Observable<number> = of(typeof window !== 'undefined').pipe(
  filter(Boolean)
)
```

This way, if `window` is undefined, we go no further and our app won't break 🎉. Now we can get to our actual logic. But, we don't really care about `window` anymore so let's switch our Observable to a new one that will let us subscribe to window events by using `switchMap` and `fromEvent`:

```typescript
const watchScroll: Observable<number> = of(typeof window !== 'undefined').pipe(
  filter(Boolean),
  switchMap(() => fromEvent(window, 'scroll', { passive: true }))
)
```

Now our Observable is emitting window scroll events. The third parameter is purely a performance optimization. [Lighthouse](https://developers.google.com/web/tools/lighthouse/) will yell at us for not using passive event listeners and it won't affect what we're doing here. There is an issue with our code as it stands right now, though. This Observable will fire off events like crazy and bring your app to a screeching halt. We need to debounce them in some way that will still give us a silky smooth animation but won't kill our performance. We can use `throttleTime` to make sure our logic will only run once every x milliseconds. Or, we can use the second parameter for `throttleTime` to use a Scheduler to handle our timing. RxJS just so happens to provide an `animationFrameScheduler` that will use `requestAnimationFrame`:

```typescript
const watchScroll: Observable<number> = of(typeof window !== 'undefined').pipe(
  filter(Boolean),
  switchMap(() => fromEvent(window, 'scroll', { passive: true })),
  throttleTime(0, animationFrameScheduler)
)
```

Great! Now that all of our performance concerns are taken care of, we can get down to the actual logic. First, we need to map our scroll position by using the `map` operator:

```typescript
const watchScroll: Observable<number> = of(typeof window !== 'undefined').pipe(
  filter(Boolean),
  switchMap(() => fromEvent(window, 'scroll', { passive: true })),
  throttleTime(0, animationFrameScheduler),
  map(() => window.pageYOffset)
)
```

At this point, we could add the `share` operator if we want to use the scroll position for other things. We could make sure we don't take any actions if we're close to the top. Or we could fire analytics events. Or anything else we want to do. Adding `share()` to our pipe function would allow us to listen to the same events in multiple places. For the purposes of this article, we won't get into that. But, this is what it might look like:

```typescript
const watchScrollPosition: Observable<number> = of(typeof window !== 'undefined').pipe(
  filter(Boolean),
  switchMap(() => fromEvent(window, 'scroll', { passive: true })),
  throttleTime(0, animationFrameScheduler),
  map(() => window.pageYOffset),
  share()
)

const watchScrollDirection: Observable<string> = watchScrollPosition.pipe(
  ...
  // we'll get to this in a second
)

const fireScrollEvents: Observable<any> = watchScrollPosition.pipe(
  ...
  // This won't add a second event listener. It will just use the events from watchScrollPosition
)
```

If we want to watch the scroll direction for our header, though, we need to have something to compare our scroll position to. Again, RxJS has a super handy `pairwise` operator that will emit the last 2 values of our observable. If we know the current scroll position and the previous scroll position, we can tell which direction the user is scrolling. Finally, we'll use the `distinctUntilChanged` operator to make sure we're not sending events every time the user scrolls if the direction doesn't change:

```typescript
const watchScroll: Observable<number> = of(typeof window !== 'undefined').pipe(
  filter(Boolean),
  switchMap(() => fromEvent(window, 'scroll', { passive: true })),
  throttleTime(0, animationFrameScheduler),
  map(() => window.pageYOffset),
  pairwise(),
  map(([previous, current]) => (current < previous ? 'Up' : 'Down')),
  distinctUntilChanged()
)
```

Putting this all together, we can create the following demo that logs the scroll direction to the console by adding `tap(console.log)` to our pipe:

<iframe src="https://codesandbox.io/embed/0yz0x6975l?expanddevtools=1" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

So all this is great but how to we actually hook it up to our component?

`rxjs-hooks` exposes custom hooks that allow us to use Observables in React components. The hook we'll be using is called `useObservable` and is different from most React hooks in that it only returns the current value. Let's take a look at how we can bring it into our component:

```tsx
import React from 'react'
import ReactDOM from 'react-dom'

import { of, fromEvent, animationFrameScheduler } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  switchMap,
  throttleTime,
} from 'rxjs/operators'

import { useObservable } from 'rxjs-hooks'

const watchScroll = () =>
  of(typeof window === 'undefined').pipe(
    filter(bool => !bool),
    switchMap(() => fromEvent(window, 'scroll', { passive: true })),
    throttleTime(0, animationFrameScheduler),
    map(() => window.pageYOffset),
    pairwise(),
    map(([previous, current]) => (current < previous ? 'Up' : 'Down')),
    distinctUntilChanged()
  )

function App() {
  const scrollDirection = useObservable(watchScroll, 'Up')

  return (
    <article className="App">
      <header className={`site-header`}>
        <span>Header</span>
      </header>
      <main>
        {['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'].map(
          (color, i) => (
            <section key={`${color}-${i}`} style={{ color: color }}>
              <span>section</span>
            </section>
          )
        )}
      </main>
    </article>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
```

Whenever the user scrolls, the value of `scrollDirection` will be the direction the user is scrolling. We can use that information to add or remove classes from our header. By animating this way, we can take advantage of the user's GPU to handle the animation and keep our main thread free. Here's what our sass file looks like:

```scss
@import '~@material/animation/functions';

... .site-header {
  // header styling:
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;

  // our animation-related styles:
  transform: translate3d(0, 0, 0);
  transition: mdc-animation-exit-temporary(transform, 250ms);
  will-change: transform;

  &.hidden {
    transform: translate3d(0, -100%, 0);
    transition: mdc-animation-enter(transform, 200ms);
  }
}
```

The default transform for our header is 0. But, if the class `hidden` is added, the header will move -100% up, out of view of the user. We're also using Google's material animation scss library to handle our animation curves so they look smooth. `ease-in`, `ease-out` or `ease-in-out` would work just fine, too. Let's bring in our css and let our observable add and remove the `hidden` class from our header:

```tsx
import React from 'react'
import ReactDOM from 'react-dom'

import { of, fromEvent, animationFrameScheduler } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  switchMap,
  throttleTime,
} from 'rxjs/operators'

import { useObservable } from 'rxjs-hooks'

import './styles.scss'

const watchScroll = () =>
  of(typeof window === 'undefined').pipe(
    filter(bool => !bool),
    switchMap(() => fromEvent(window, 'scroll', { passive: true })),
    throttleTime(0, animationFrameScheduler),
    map(() => window.pageYOffset),
    pairwise(),
    map(([previous, current]) => (current < previous ? 'Up' : 'Down')),
    distinctUntilChanged()
  )

function App() {
  const scrollDirection = useObservable(watchScroll, 'Up')

  return (
    <article className="App">
      <header
        className={`site-header ${scrollDirection === 'Down' && 'hidden'}`}
      >
        <span>Header</span>
      </header>
      <main>
        {['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'].map(
          (color, i) => (
            <section key={`${color}-${i}`} style={{ color: color }}>
              <span>section</span>
            </section>
          )
        )}
      </main>
    </article>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
```

That's it! We now have a fixed header that hides when the user scrolls down and comes back when the user scrolls up. For a working demo, see the Code Sandbox below:

<iframe src="https://codesandbox.io/embed/x9x87mv3mw" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

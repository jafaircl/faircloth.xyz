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

You can set this up with any combination of React classes, the Context API, Redux and probably a hundred other concepts. But, it's 2019 and we're doing Hooks now so that's what we'll use here. As of this writing, you'll need to use alpha versions of React and React-DOM to take advantage of Hooks. You can do that by running this command in your project:

```sh
npm install --save react@16.8.0-alpha.0 react-dom@16.8.0-alpha.0
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

```jsx
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

Now, let's talk about RxJS.

`of`

`fromEvent`

Operators

`filter`

`switchMap`

`animationFrameScheduler`

`throttleTime`

`map`

`pairwise`

`distinctUntilChanged`

Putting them all together, we can create the following demo that logs the scroll direction to the console:

<iframe src="https://codesandbox.io/embed/0yz0x6975l?expanddevtools=1" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Talk about how to hook it up to React with rxjs-hooks

<iframe src="https://codesandbox.io/embed/x9x87mv3mw" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

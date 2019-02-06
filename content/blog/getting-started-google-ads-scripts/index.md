---
title: Getting Started With Google Ads Scripts
description: Placeholder description
featuredImage: ./default-logo.png
date: '2019-01-14T22:12:03.284Z'
tags: ['Google Ads', 'Google Ads Scripts']
published: false
---

## Prerequisites

You do not _need_ to have much (if any) experience with JavaScript to get started with Google Ads scripts. In fact, the runtime environment for them is missing quite a few modern features found in ES5/6/7. While the `const` and `let` keywords are supported, arrow functions are not. `Object.keys` works but `Object.values` doesn't. Promises, classes, default parameters, and template literals do not. Destructuring assignments work for arrays but not for objects. Some more experienced programmers may find Scripts frustrating for these reasons. Coders that don't know or care about arrow functions, template literals, and destructuring objects won't miss them. Coming in fresh can be more of a benefit than you realize.

## Set up your development environment

You can use the Google Ads UI's IDE to write your scripts. It has autocomplete functionality, which can be very useful. Especially when you're just starting out.

But eventually, you may want to bring in third party libraries. Or maybe your scripts are valuable and you want to safely store them or you want to use version control and share them with the world on Github. For that, you will need an IDE. There are many out there to choose from and the one you choose will come down to personal preference. Mine is [VS Code](https://code.visualstudio.com/) but [Atom](https://atom.io/), [Sublime](https://www.sublimetext.com/), [Brackets](http://brackets.io/) or any of the others will work as well.

We won't bother with it for now, but, you can also use TypeScript in your IDE to reclaim the autocomplete functionality you lose by moving outside the UI.

## Create your first script

```javascript
function main() {
  const keywords = AdsApp.keywords().get()
  while (keywords.hasNext()) {
    const keyword = keywords.next()
    Logger.log(keyword)
  }
}
```

## Getting to know Google Ads entities

## Limitations of Google Ads scripts

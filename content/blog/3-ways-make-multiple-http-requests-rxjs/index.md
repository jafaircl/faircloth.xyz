---
title: 3 Ways To Make Multipe HTTP Requests Using RxJS
description: Placeholder description
featuredImage: ./default-logo.png
date: '2019-07-16T22:12:03.284Z'
tags: ['RxJS']
published: true
---

When developing apps, you may find that you need to make multiple HTTP requests at once. Depending on your use case, you may need to make your requests in parallel or sequentially. You may need to rate-limit requests or deal with pagination. Luckily, RxJS provides many different ways to do this.

## Parallel HTTP Requests

If you need to make multiple requests simultaneously and they don't depend on each other or need to be rate-limited, the method is fairly straightforward. We can use `forkJoin` to make multiple parallel HTTP requests. `forkJoin` will wait for all of the observables to complete, then emit the last value for each observable in the array.

```typescript
import { forkJoin, from } from 'rxjs'
import { tap } from 'rxjs/operators'

// A simple request Observable we can reuse to clean up our examples
const request = (url: string) => from(fetch(url).then(res => res.json()))

const test = () =>
  forkJoin([
    request(`https://api.example.com/1/`),
    request(`https://api.example.com/2/`),
    request(`https://api.example.com/3/`),
  ])
    .pipe(tap(console.log))
    .subscribe()
```

We'll get an array with the data from each API call. Here's a demo using [the SWAPI](https://swapi.co/) to get data about 3 different characters:

<iframe src="https://codesandbox.io/embed/confident-wood-uhlmh?fontsize=14" title="confident-wood-uhlmh" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## Sequential HTTP Requests

Occasionally, you may need to use the data in the response from one request to get more information. For example, we may need to get all of the movies in which Luke Skywalker appears. We can use `switchMap` to use data from one observable to switch to a set of parallel requests to get data for all the movies:

```typescript
import { forkJoin, from } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'

// A simple request Observable we can reuse to clean up our examples
const request = (url: string) => from(fetch(url).then(res => res.json()))

const test = () =>
  request(`https://swapi.co/api/people/1/`)
    .pipe(
      switchMap(response => forkJoin(response.films.map(url => request(url)))),
      tap(console.log)
    )
    .subscribe()
```

<iframe src="https://codesandbox.io/embed/blazing-smoke-0fbfx?fontsize=14" title="blazing-smoke-0fbfx" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## Rate-Limiting HTTP Requests

Now, let's imagine that the SWAPI doesn't like for us to make calls more than once per second. This is a rate-limited situation. There are a couple of different ways to handle it. We can use the `delay` operator to pause between the first call and the next. Then, we can use `switchMap` to get an observable which emits the film urls in order. Next, we'll use `concatMap` to get a delayed request and `scan` (or `reduce`) to collect our data as it comes in.

```typescript
const test = () =>
  request(`https://swapi.co/api/people/1/`)
    .pipe(
      delay(1000),
      switchMap(response => from(response.films)),
      concatMap((url: string) => request(url).pipe(delay(1000))),
      scan((acc, res) => [...acc, res.title], []),
      tap(console.log)
    )
    .subscribe()
```

<iframe src="https://codesandbox.io/embed/determined-noether-bgdl2?fontsize=14" title="determined-noether-bgdl2" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This works well. But, if we need to do it a lot, it can be a bit cumbersome. It also evenly distributes calls, which may not be what we want. If we are allowed to cal the API 2 times per second, we can probably make both calls at the beginning of the second rather than waiting 0.5 seconds between them.

We can also write a custom operator to handle our rate-limiting for us. The below code is adapted from [Gergely Sipos's solution](https://aliz.ai/rate-limiting-in-rxjs/), which can be found in the [rxjs-ratelimit repo](https://github.com/gsipos/rxjs-ratelimit), updated to work with RxJS 6:

```typescript
import {
  asyncScheduler,
  BehaviorSubject,
  timer,
  MonoTypeOperatorFunction,
  Observable,
} from 'rxjs'
import { filter, map, mergeMap, take } from 'rxjs/operators'

export function rateLimit<T>(
  count: number,
  slidingWindowTime: number,
  scheduler = asyncScheduler
): MonoTypeOperatorFunction<T> {
  let tokens = count
  const tokenChanged = new BehaviorSubject(tokens)
  const consumeToken = () => tokenChanged.next(--tokens)
  const renewToken = () => tokenChanged.next(++tokens)
  const availableTokens = tokenChanged.pipe(filter(() => tokens > 0))

  return mergeMap<T, Observable<T>>((value: T) =>
    availableTokens.pipe(
      take(1),
      map(() => {
        consumeToken()
        timer(slidingWindowTime, scheduler).subscribe(renewToken)
        return value
      })
    )
  )
}
```

With this custom operator, we can define how many requests can occur over a given time period. From there, the operator will handle all rate limiting for us. Now we can do more complicated operations. Let's say we want to grab 4 people from the SWAPI, then see all the movies they are in. But, we need to rate limit it. Here's what that could look like with our new operator:

```typescript
const test = () =>
  from([
    `https://swapi.co/api/people/1/`,
    `https://swapi.co/api/people/2/`,
    `https://swapi.co/api/people/3/`,
    `https://swapi.co/api/people/4/`,
  ])
    .pipe(
      rateLimit(1, 1000),
      concatMap((url: string) => request(url)),
      reduce((acc, response) => [...acc, ...response.films], []),
      switchMap(from),
      rateLimit(1, 1000),
      concatMap((url: string) => request(url)),
      scan((acc, res) => [...acc, res.title], []),
      tap(console.log)
    )
    .subscribe()
```

<iframe src="https://codesandbox.io/embed/suspicious-williamson-li3b7?fontsize=14" title="suspicious-williamson-li3b7" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

With these tools, sending multiple HTTP requests, even in rate-limited situations, should be no problem with the help of RxJS. Do you know of any other ways to send multiple requests?

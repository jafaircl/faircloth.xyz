---
title: 'Getting Started With AdWords Scripts: The Main Function'
description: AdWords Scripts can make your life much easier. Routine maintenance tasks can be automated, reporting can be simplified and functionality can even be added to the AdWords platform itself! But, before we can do any of that, we need to know how to get started.
featuredImage: ./default-logo.png
date: '2016-11-26T22:12:03.284Z'
tags: ['Google Ads', 'Google Ads Scripts']
published: true
---

AdWords Scripts can make your life much easier. Routine maintenance tasks can be automated, reporting can be simplified and functionality can even be added to the AdWords platform itself! But, before we can do any of that, we need to know how to get started. This will be the first in a series of posts that I hope will help beginners get started in the world of AdWords Scripts and JavaScript. Let’s talk about the main function.

## What is the Main function anyway?

If you’ve browsed through the official Google script examples, you may have noticed that every one has a common feature: the main function. So what is it? In short, it’s the only function that AdWords will actually run. Without it, your script, no matter how elegant or clever, won’t actually _do_ anything at all.

There are 2 approaches you can take to using the main function:

### Keep everything in the main function

This works fine for short, simple scripts. But, it can become hard to read as you want to do more and more things. Let’s say you want to check for every keyword in your account that has 0 clicks over the past 30 days then label it. The first step is to get all the keywords that match. For now, we’ll just log what they are.

```javascript
function main() {
  var keywordIterator = AdWordsApp.keywords()
    .withCondition('Clicks = 0')
    .forDateRange('LAST_30_DAYS')
    .get()

  while (keywordIterator.hasNext()) {
    var keyword = keywordIterator.next()
    Logger.log(keyword.getText() + ' has 0 clicks')
  }
}
```

Neat. Now we need to label them. Seems straightforward enough, let’s apply a label to each one by replacing `Logger.log(keyword.getText() + ' has 0 clicks');` with `keyword.applyLabel('This keyword sucks at life');`

Aaaaand that’s an error. Why? That label (probably) doesn’t exist in your account. We could go in manually and add the label then run it again. But, if you had to do that any time you wanted to add a particular label, it would quickly become tedious. For example, I wrote a script that would run through ad groups, use statistics to A/B test all the ads, and label them with the probability that each one was better than the one with the most impressions. Creating 100 labels in the interface sounds just awful. Using the editor sounds only slightly less rage-inducing. Using a JavaScript to add them in as the script ran was a better use for both my time and my sanity. This is an extreme case. But, sometimes, we need an extreme case to find a better way to do something.

Let’s try our script again but, this time, let’s create the label before we try to use it.

```javascript
function main() {
  AdWordsApp.createLabel('This keyword sucks at life')

  var keywordIterator = AdWordsApp.keywords()
    .withCondition('Clicks = 0')
    .forDateRange('LAST_30_DAYS')
    .get()

  while (keywordIterator.hasNext()) {
    var keyword = keywordIterator.next()
    keyword.applyLabel('This keyword sucks at life')
  }
}
```

It works! But, let’s imagine for a second that we want to do the same thing for ad groups, ads and locations. That looks like this:

```javascript
function main() {
  AdWordsApp.createLabel('This keyword sucks at life')
  AdWordsApp.createLabel('This ad group sucks at life')
  AdWordsApp.createLabel('This ad sucks at life')

  var keywordIterator = AdWordsApp.keywords()
    .withCondition('Clicks = 0')
    .forDateRange('LAST_30_DAYS')
    .get()

  while (keywordIterator.hasNext()) {
    var keyword = keywordIterator.next()
    keyword.applyLabel('This keyword sucks at life')
  }

  var adGroupIterator = AdWordsApp.adGroups()
    .withCondition('Clicks = 0')
    .forDateRange('LAST_30_DAYS')
    .get()

  while (adGroupIterator.hasNext()) {
    var adGroup = adGroupIterator.next()
    adGroup.applyLabel('This ad group sucks at life')
  }

  var adIterator = AdWordsApp.ads()
    .withCondition('Clicks = 0')
    .forDateRange('LAST_30_DAYS')
    .get()

  while (adIterator.hasNext()) {
    var ad = adIterator.next()
    ad.applyLabel('This ad sucks at life')
  }

  var locationIterator = AdWordsApp.targeting()
    .targetedLocations()
    .withCondition('Clicks = 0')
    .forDateRange('LAST_30_DAYS')
    .get()

  while (locationIterator.hasNext()) {
    var location = locationIterator.next()
    location.applyLabel('This location sucks at life')
  }
}
```

This is getting a little out of hand. What can we do to clean this up a little bit?

### Keep things DRY

We can definitely make things a little easier on ourselves by adhering to the D.R.Y. principle. D.R.Y. stands for “Don’t Repeat Yourself.” In our above code, we’re doing the same thing a whole bunch of times while only switching out one or two things. Instead of doing all that, let’s write a quick function that will do everything we want. Then, we can pass in the label name, our conditions and the thing we want to label for each of them. This generalized function will make everything we want to do above a little cleaner. But, it will also allow us to label anything for any reason. We’re not limited to the one thing we set out to do. We can use it over and over again without having to rewrite the same function. Let’s take a look:

```javascript
// We're going to create a function that we can use over and over to label some things
function labeler(params) {
  // placeholder variable. We'll use it later
  var item

  // check for the label name by trying to get it
  var labelIterator = AdWordsApp.labels()
    .withCondition('Name = "' + params.labelName + '"')
    .get()

  // if no label with that name is found, create it
  if (!labelIterator.hasNext()) {
    AdWordsApp.createLabel(params.labelName)
  }

  entity = params.entity

  // go through each condition and add it to the selector
  for (i = 0; i < params.conditions.length; i += 1) {
    entity = entity.withCondition(params.conditions[i])
  }

  // if there's a date range, add that to our selector too
  if (params.dateRange) {
    entity = entity.forDateRange(params.dateRange)
  }

  // go fetch
  entity = entity.get()

  // go through each item and apply the label
  while (entity.hasNext()) {
    item = entity.next()
    item.applyLabel(params.labelName)
  }
}

function main() {
  // now we call our newly created function inside the main function
  // substitute in your label name, whatever you want to get, an array of conditions and an (optional) date range
  labeler({
    entity: AdWordsApp.keywords(),
    conditions: ['Clicks = 0'],
    dateRange: 'LAST_30_DAYS',
    labelName: 'This keyword sucks at life',
  })

  labeler({
    entity: AdWordsApp.adGroups(),
    conditions: ['Clicks = 0'],
    dateRange: 'LAST_30_DAYS',
    labelName: 'This ad group sucks at life',
  })

  labeler({
    entity: AdWordsApp.ads(),
    conditions: ['Clicks = 0'],
    dateRange: 'LAST_30_DAYS',
    labelName: 'This ad sucks at life',
  })

  labeler({
    entity: AdWordsApp.targeting().targetedLocations(),
    conditions: ['Clicks = 0'],
    dateRange: 'LAST_30_DAYS',
    labelName: 'This location sucks at life',
  })
}
```

Much better. We only wrote our function once (didn’t repeat ourselves) and we can make it do other things! Say you want, in addition to keywords/ads/ad groups/whatever with no clicks, you only want to get ones that have at least 100 impressions. Just change `conditions: ['Clicks = 0'],` to `conditions: ['Clicks = 0', 'Impressions > 100'],`.

We can even simplify it from there! Instead of typing out our “labeler” function over and over again, we can set a variable that contains all of our conditions. Then, we can use a for loop to go through each one and apply the labeler function. Check it out:

```javascript
var parameters = {
  // what we name these objects is irrelevant. They just need to have the
  // correct property names (entity, conditions, dateRange and labelName).
  keywords: {
    entity: AdWordsApp.keywords(),
    conditions: ['Clicks = 0'],
    dateRange: 'LAST_30_DAYS',
    labelName: 'This keyword sucks at life',
  },
  adGroups: {
    entity: AdWordsApp.adGroups(),
    conditions: ['Clicks = 0'],
    dateRange: 'LAST_30_DAYS',
    labelName: 'This ad group sucks at life',
  },
  ads: {
    entity: AdWordsApp.ads(),
    conditions: ['Clicks = 0'],
    dateRange: 'LAST_30_DAYS',
    labelName: 'This ad sucks at life',
  },
  locations: {
    entity: AdWordsApp.targeting().targetedLocations(),
    conditions: ['Clicks = 0'],
    dateRange: 'LAST_30_DAYS',
    labelName: 'This location sucks at life',
  },
}

function main() {
  // Let's run a for loop to go through our parameters and run our function.
  // When you have an object filled with objects, a for loop is the way to go.
  for (var thing in parameters) {
    labeler(parameters[thing])
  }
}

// We've moved our labeling function down here to talk about for loops and other stuff
function labeler(params) {
  var items, item

  // check for the label name by trying to get it
  var labelIterator = AdWordsApp.labels()
    .withCondition('Name = "' + params.labelName + '"')
    .get()

  // if no label with that name is found, create it
  if (!labelIterator.hasNext()) {
    AdWordsApp.createLabel(params.labelName)
  }

  entity = params.entity

  // go through each condition and add it to the selector
  for (i = 0; i < params.conditions.length; i += 1) {
    entity = entity.withCondition(params.conditions[i])
  }

  // if there's a date range, add that to our selector too
  if (params.dateRange) {
    entity = entity.forDateRange(params.dateRange)
  }

  // go fetch
  items = entity.get()

  // go through each item and apply the label
  while (items.hasNext()) {
    item = items.next()
    item.applyLabel(params.labelName)
  }
}
```

Now that we have that function written, there are some other cool things we can do. If you have experience with JavaScript, you’re probably familiar with the fact that you can pass one function into another. We can modify the above script to go beyond labeling things and to do pretty much anything we can dream up! We’ll get to that later but, for now, I hope I’ve made a good argument that keeping things D.R.Y and separating your functions can make things easier in the long run.

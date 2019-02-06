---
title: How To Make Sure You Never Run Another Ad On Breitbart Again
description: Some things are more important than your conversion funnel
featuredImage: ./default-logo.png
date: '2018-01-12T22:12:03.284Z'
tags: ['Google Ads', 'Google Ads Scripts']
published: true
---

Since Google doesn't want to stop supporting Breitbart and the rest of their ilk, I'll show you how to make sure your AdWords/Google Display Network ads never show up there again. It's super easy and you'll be able to live with yourself knowing you're not supporting right-wing hate groups. With any luck whatsoever, they'll go out of business and be forced to re-evaluate their lives. Let's do this.

## Step 1

Open AdWords

## Step 2

On the left hand menu of the older interface, there's a "Bulk Operations" option. Click it. In the new interface, click the wrench icon at the top right and under "Bulk Actions," click "Scripts"

## Step 2.5

In the old interface, under "Scripts," click "Create and manage scripts." The new interface drops you where you need to be once you follow the last step.

## Step 3

Click the big red button that says "+ Scripts" on the old interface or the big blue "+" button in the new one.

## Step 4

Clear out the big textarea that currently says `function main() { }` and copy/paste this:

```javascript
var idiots = ['http://www.breitbart.com/', 'https://www.breitbart.com/']

function main() {
  var excludedPlacementListOperation = AdWordsApp.newExcludedPlacementListBuilder()
    .withName("Don't support hate groups")
    .build()
  var excludedPlacementList = excludedPlacementListOperation.getResult()
  excludedPlacementList.addExcludedPlacements(idiots)
  var campaignIterator = AdWordsApp.campaigns().get()
  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next()
    campaign.addExcludedPlacementList(excludedPlacementList)
  }
  Logger.log('👋')
}
```

## Step 5

There's a big yellow button telling you to click "Authorize." Go ahead and do that. Then click "Preview." Then click "Run."

## Step 6

Go get a beer or dox a Nazi or whatever you do to relax.

You can schedule this script to run every day and make sure no dime ever goes from your pocket to theirs. Maybe run it every hour. Just in case. Feel free to add more idiots to the list if you want. Google has a version that lets you use a Google Sheet. Do whatever you want. Just don't support bigots. We all have to live in this world. Try to make it not suck.

---
title: Sending Performance Alerts With AdWords Scripts
description: Performance alerts is one of the most frequently requested uses of AdWords Scripts. Let's talk about how you can automate your alerts.
featuredImage: ./default-logo.png
date: '2016-11-26T22:12:03.284Z'
tags: ['Google Ads', 'Google Ads Scripts']
published: true
---

Performance alerts is one of the most frequently requested uses of AdWords Scripts. Let’s talk about how you can automate your alerts.

[In the previous post](/getting-started-adwords-scripts-main-function/), we created a function that we could use to label whatever we wanted for any reason. I mentioned at the end that we can use the same function to do much more than just labeling. So first, let’s take a look at how we can do that.

## What is a callback function?

In short, [a callback function is a function that can be passed into another function](http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/). That sounds a little confusing so let’s take a look at a simple example within the context of AdWords Scripts. We’re going to create a simple function that iterates through keywords with no clicks in the last 30 days and allows us to do something with each one.

```javascript
function iterator(fn) {
  // A standard keyword iterator function found in the google docs
  var keywordIterator = AdWordsApp.keywords()
    .withCondition('Clicks = 0', 'Impressions > 100')
    .forDateRange('LAST_30_DAYS')
    .get()

  while (keywordIterator.hasNext()) {
    // We need to be able to tell the function what it is we're talking about
    // so let's say that this keyword is the next keyword in the iterator
    this.keyword = keywordIterator.next()

    // run the function you want to pass by adding () to it
    fn()
  }
}

function main() {
  // create the label
  AdWordsApp.createLabel('This keyword is turrible')

  // run our function
  iterator(function() {
    // We want the current keyword. Because we set it as "this.keyword" that's what we call
    this.keyword.applyLabel('This keyword is turrible')
  })
}
```

You’ll notice that we’re using the “this” keyword here. Don’t freak out. We’re not doing anything crazy with it. It’s just setting the context for our callback function.

Now we have a function that can go through keywords that have 0 clicks and do whatever we want to it. That’s pretty cool but what if we want to change the conditions? What if we want to go through all the ad groups instead? Let’s open up our function by modifying the example from the last post.

```javascript
// Add a "params" variable
function iterator(params, fn) {
  var items, item, i

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
    // instead of setting this.keyword, let's set this.item so we can
    // get whatever we want instead of just keywords.
    this.item = items.next()
    fn()
  }
}

function main() {
  // set our parameters and run our function
  iterator(
    {
      entity: AdWordsApp.keywords(),
      conditions: ['Clicks = 0', 'Impressions > 100'],
      dateRange: 'LAST_30_DAYS',
    },
    function() {
      // We want the current keyword. Because we set it as "this.item" that's what we call
      var keyword = this.item
      Logger.log(keyword.getText())
    }
  )
}
```

Now we have a function that accepts some parameters and a callback function that we can use to _do_ whatever we want _to_ whatever we want.

### I wanted to learn how to create performance alerts, not hear about callback functions

It’s important, though! We can use this function to set up performance alerts. We’ll also be able to do pretty much whatever else we want. But for now, let’s get back to the performance alerts.

We need to be able to send an email alert to a specified address whenever certain conditions are met. Luckily, Google has given us a way to do that by providing a mail service. You can easily send an email through AdWords Scripts by doing something like this:

```javascript
MailApp.sendEmail({
  to: 'recipient@example.com',
  subject: 'Check out this email',
  htmlBody: "Just kidding there's nothing here",
})
```

Now we just need to get our data into our email. How are we going to do that? We’re going to set an emailBody variable that is initially completely blank. As we iterate through the keywords/ad groups/whatever, we’ll add things to it. If it’s still blank at the end, we won’t send any emails. If it has something in it, we will. Here’s what it looks like all together:

```javascript
function iterator(params, fn) {
  var items, item, i

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
    // instead of setting this.keyword, let's set this.item so we can
    // get whatever we want instead of just keywords.
    this.item = items.next()
    fn()
  }
}

function main() {
  var emailBody = ''

  // set our parameters and run our function
  iterator(
    {
      entity: AdWordsApp.keywords(),
      conditions: ['Clicks = 0', 'Impressions > 100'],
      dateRange: 'LAST_30_DAYS',
    },
    function() {
      // We want the current keyword. Because we set it as "this.item" that's what we call
      var keyword = this.item

      // add some html to the email
      emailBody +=
        '<p>' +
        keyword.getCampaign().getName() +
        ' - ' +
        keyword.getAdGroup().getName() +
        ' - ' +
        keyword.getText() +
        '</p>'
    }
  )

  // check to make sure the email isn't blank
  if (emailBody != '') {
    MailApp.sendEmail({
      to: 'recipient@example.com',
      subject: 'Keywords with 0 clicks over the last 30 days',
      htmlBody: emailBody,
    })
  }
}
```

## Setting multiple alert conditions

If we want to set alerts for multiple conditions, we can do that pretty easily. Let’s say we want alerts for ad groups that have no clicks in the last 30 days, keywords that have no impressions in the last 30 days, and ads that have never gotten a click. We can move our parameters into a separate variable and iterate through them, adding to the email body as we go.

```javascript
var parameters = {
  adGroups: {
    entity: AdWordsApp.adGroups(),
    conditions: ['Clicks = 0'],
    dateRange: 'LAST_30_DAYS',
  },
  keywords: {
    entity: AdWordsApp.keywords(),
    conditions: ['Impressions = 0'],
    dateRange: 'LAST_30_DAYS',
  },
  ads: {
    entity: AdWordsApp.ads(),
    conditions: ['Clicks = 0'],
    dateRange: 'ALL_TIME',
  },
}

function main() {
  for (var thing in parameters) {
    var emailBody = ''

    // set our parameters and run our function
    iterator(parameters[thing], function() {
      if (this.item.getEntityType() == 'AdGroup') {
        emailBody +=
          '<p>' +
          this.item.getCampaign().getName() +
          ' - ' +
          this.item.getName() +
          ' has no clicks in the last 30 days</p>'
      } else if (this.item.getEntityType() == 'Keyword') {
        emailBody +=
          '<p>' +
          this.item.getCampaign().getName() +
          ' - ' +
          this.item.getText() +
          ' has no impressions in the last 30 days</p>'
      } else if (this.item.getEntityType() == 'Ad') {
        emailBody +=
          '<p>' +
          this.item.getCampaign().getName() +
          ' - ' +
          this.item.getAdGroup().getName() +
          ' - ' +
          this.item.getName() +
          ' has no clicks ever</p>'
      }
    })

    if (emailBody != '') {
      MailApp.sendEmail({
        to: 'recipient@example.com',
        subject:
          'Performance Alerts For ' + AdWordsApp.currentAccount().getName(),
        htmlBody: emailBody,
      })
    }
  }
}

// Move this to the bottom to get it out of the way. The order doesn't matter (usually)
function iterator(params, fn) {
  var items, item, i

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
    // instead of setting this.keyword, let's set this.item so we can
    // get whatever we want instead of just keywords.
    this.item = items.next()
    fn()
  }
}
```

There you have it. Now you can set up your performance alerts based on whatever conditions you choose! If only want one email per account, move `var emailBody = '';` and the MailApp function outside of the for loop. Feel free to leave any questions in the comments!

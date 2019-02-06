---
title: An AdWords Script To Monitor Campaign Performance
description: Here's an AdWords Script to monitor campaign performance and send email alerts on a recurring basis. Schedule it to run daily or weekly.
featuredImage: ./default-logo.png
date: '2016-09-14T22:12:03.284Z'
tags: ['Google Ads', 'Google Ads Scripts']
published: true
---

Here’s a Google AdWords script to monitor campaign performance and send periodic email alerts. You can schedule it to run daily or weekly and stay on top of your campaigns. Over on [/r/PPC](https://www.reddit.com/r/PPC/comments/501o8m/adwords_script_help_video_campaign_performance/?ref=share&ref_source=embed&utm_content=title&utm_medium=post_embed&utm_name=c9a03d4504964c1a8bf734265375e224&utm_source=embedly&utm_term=501o8m), a user asked for help with a script to monitor their video campaign performance.

I wrote a quick script to help and send e-mail alerts on a recurring basis. Here’s how it works. First of all, the script in its entirety:

```javascript
var variables = {
  campaignNameCheck: 'video',
  statsPeriod: 'YESTERDAY',
  impressions: 10,
  emailRecipient: 'test@test.com',
  sendEmail: false,
  emailBody: '',
}

function main() {
  try {
    checkVideoCampaigns()
  } catch (err) {
    Logger.log("Whoops! There was an error. Let's try that again.")
  }

  if (variables.sendEmail == true) {
    MailApp.sendEmail({
      to: variables.emailRecipient,
      subject: 'Video Campaign Report',
      htmlBody: variables.emailBody,
    })
  }
}

function checkVideoCampaigns() {
  var campaignIterator = AdWordsApp.campaigns()
    .forDateRange(variables.statsPeriod)
    .withCondition('Impressions >= ' + variables.impressions)
    .withCondition(
      "CampaignName CONTAINS_IGNORE_CASE '" + variables.campaignNameCheck + "'"
    )
    .get()

  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next(),
      stats = campaign.getStatsFor('YESTERDAY'),
      statLogs =
        campaign.getName() +
        ', ' +
        stats.getImpressions() +
        ' impressions, ' +
        stats.getClicks() +
        ' clicks, ' +
        stats.getCost() +
        ' cost'

    Logger.log(statLogs)

    variables.sendEmail = true
    variables.emailBody += statLogs + '<br>'
  }
}
```

It may seem a little complicated but it’s actually pretty straightforward. First thing’s first, we need to define some variables.

## The Script Variables

```javascript
var variables = {
  campaignNameCheck: 'video',
  statsPeriod: 'YESTERDAY',
  impressions: 10,
  emailRecipient: 'test@test.com',
  sendEmail: false,
  emailBody: '',
}
```

I put them in an object because, if you have a lot of variables, keeping them organized in separate objects can be helpful. Obviously here we don’t have a large number of variables, but it’s one of my own personal best practices.

First, we need to figure out which campaigns we’re going to target. We could target only video campaigns, like the user asked for. But, that would make the script useless for anything else. By using a campaign name regex to check our campaigns, we’re not limited to video campaigns only. We can change the `campaignNameCheck` variable and target search, display, app, whatever. Keep things DRY.

Next, we need a time period for our Adwords Script to check. In this particular case, we set `statsPeriod: 'YESTERDAY'` since we want this script to run daily. Here’s a list of the other possible values you can use here, straight from the [Adwords Script reference](https://developers.google.com/adwords/scripts/docs/reference/adwordsapp/adwordsapp_campaignselector#forDateRange_1):

```javascript
TODAY
YESTERDAY
LAST_7_DAYS
THIS_WEEK_SUN_TODAY
LAST_WEEK
LAST_14_DAYS
LAST_30_DAYS
LAST_BUSINESS_WEEK
LAST_WEEK_SUN_SAT
THIS_MONTH
LAST_MONTH
ALL_TIME
```

As you can see, we’ve got plenty of options.

Next, we want to set an impressions threshold using the `impressions` variable. In general, the less frequent you schedule your script to run, the higher this number should be. 10 impressions is fine for yesterday but, if you’re scheduling it once a week, you might consider raising it.

The `emailRecipient` variable is pretty straightforward. This is where you want your emails to go. We also have `sendEmail` and `emailBody`. `sendEmail` should always be set to false at the beginning. `emailBody` will be filled out by our script as it runs. For now, it needs to be an empty string.

## The AdWords Script Main Function

AdWords Scripts will only really run your “main” function. Any other functions you want to run have to be called from the main function. Let’s take a look:

```javascript
function main() {
  try {
    checkVideoCampaigns()
  } catch (err) {
    Logger.log("Whoops! There was an error. Let's try that again.")
  }

  if (variables.sendEmail == true) {
    MailApp.sendEmail({
      to: variables.emailRecipient,
      subject: 'Video Campaign Report',
      htmlBody: variables.emailBody,
    })
  }
}
```

You’ll notice that we’re using a try/catch here. Like the object variables, it’s overkill for what we’re trying to do. But, it can come in handy when you try to run the same function multiple times while iterating over multiple accounts or campaigns. This try/catch is pretty straightforward. We try the `checkVideoCampaigns` function and if there’s an error, we send a message to the AdWords Script logger.

The next part is what actually sends the e-mail. [Google Apps provide a built-in way to send emails from AdWords Scripts](https://developers.google.com/adwords/scripts/docs/examples/mailapp). Remember when we set the `sendEmail` variable to false? The `checkVideoCampaigns` function will set it to true if it finds a campaign with impressions to report on. If it doesn’t, you probably don’t want an email. This will keep the script from sending you a bunch of emails you don’t want or need. You can also attach images or CSV files to your email. We’ll go over that in another post.

## Where The Magic Happens

The `checkVideoCampaigns` function is where all of the work is actually done. First, we need to create an object that holds all of the campaigns that meet our conditions. At the minimum, we need to specify a date range. We can also add conditions to our query. We’re going to use our impressions and campaign name variables to filter our campaigns we don’t care about. Here’s what that looks like:

```javascript
var campaignIterator = AdWordsApp.campaigns()
  .forDateRange(variables.statsPeriod)
  .withCondition('Impressions >= ' + variables.impressions)
  .withCondition(
    "CampaignName CONTAINS_IGNORE_CASE '" + variables.campaignNameCheck + "'"
  )
  .get()
```

Now, we need to iterate through our object, get the stats for our date range, add those stats to our email and tell the MailApp that we do want to send the email after all. We’re using a while loop to do this. In the original question, the user was trying an if statement and only getting the script to iterate through one campaign. This makes sense if you think about how if statements and while loops work. An if statement will check if the statement is true. If it is, it will execute the code block and move on. A while loop, on the other hand, will check the statement again when it gets to the end of the code block. It will only move on when the statement evaluates to false. This is also why we can’t say

In the original question, the user was trying an if statement and only getting the script to iterate through one campaign. This makes sense if you think about how if statements and while loops work. An if statement will check if the statement is true. If it is, it will execute the code block and move on. A while loop, on the other hand, will check the statement again when it gets to the end of the code block. It will only move on when the statement evaluates to false. This is also why we can’t say

A while loop, on the other hand, will check the statement again when it gets to the end of the code block. It will only move on when the statement evaluates to false. This is also why we can’t say `variables.emailBody = statLogs + '<br>';`. This would overwrite our email body every time the loop iterates. The email would only contain the results from the last iteration of the loop. We have to use `+=` instead to append each iteration to the last one.

Here’s our completed script:

```javascript
var variables = {
  campaignNameCheck: 'video',
  statsPeriod: 'YESTERDAY',
  impressions: 10,
  emailRecipient: 'test@test.com',
  sendEmail: false,
  emailBody: '',
}

function main() {
  try {
    checkVideoCampaigns()
  } catch (err) {
    Logger.log("Whoops! There was an error. Let's try that again.")
  }

  if (variables.sendEmail == true) {
    MailApp.sendEmail({
      to: variables.emailRecipient,
      subject: 'Video Campaign Report',
      htmlBody: variables.emailBody,
    })
  }
}

function checkVideoCampaigns() {
  var campaignIterator = AdWordsApp.campaigns()
    .forDateRange(variables.statsPeriod)
    .withCondition('Impressions >= ' + variables.impressions)
    .withCondition(
      "CampaignName CONTAINS_IGNORE_CASE '" + variables.campaignNameCheck + "'"
    )
    .get()

  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next(),
      stats = campaign.getStatsFor('YESTERDAY'),
      statLogs =
        campaign.getName() +
        ', ' +
        stats.getImpressions() +
        ' impressions, ' +
        stats.getClicks() +
        ' clicks, ' +
        stats.getCost() +
        ' cost'

    Logger.log(statLogs)

    variables.sendEmail = true
    variables.emailBody += statLogs + '<br>'
  }
}
```

## Where We Could Do Better

Using the iterators to build our report is fine if we’re not calling for the stats of a whole bunch of different things. For campaigns, it’s probably fine. For ads or keywords, we would probably need to use the AdWords Script report functionality so our script doesn’t run up against the time limit (30 minutes for individual accounts). We could also format our email to be a little more pretty. What else do you see? Leave your suggestions in the comments!

---
title: Training Chatbots To Monitor Sensitive AdWords Display Placements
description: Make sure your display placements are brand-safe.
featuredImage: ./default-logo.png
date: '2018-01-14T22:12:03.284Z'
tags: ['Machine Learning', 'Node.js', 'Google Ads']
published: true
---

Policing your automatic display placements is no longer an option. Having your ad appear next to questionable content is a great way to alienate customers or upset clients. So, what can you do? Looking through every ad placement URL on a daily or weekly basis to determine if it's brand-safe sounds like a Sisyphean task that no human should ever have to endure. Let's make a robot do it.

We're going to write 2 simple JavaScript files. The first will be an AdWords Script to get url placements and call an API. The second will be a Node.js file that will act as our API. If you're the type that likes to skip ahead, all the code for this post is on Github.

First, let's get started on our AdWords Script. We will want to pull a URL Performance Report from the AdWords API. To do that, we'll use the `AdWordsApp.report()` method. If you're not familiar with the AdWords Scripts environment, it is a version of Google Apps Scripts that is embedded directly into Google AdWords. They have a spectacular documentation site that you can use to familiarize yourself with the ins and outs of how they work.

Our use case is fairly straightforward, though. First we need to get a report using AWQL:

```javascript
var report = AdWordsApp.report(
  'SELECT Url, Domain, Clicks, Impressions, Cost ' +
    'FROM   URL_PERFORMANCE_REPORT ' +
    'WHERE  Impressions > 0 ' +
    'DURING LAST_7_DAYS'
)
```

If you're familiar with SQL, AWQL (AdWords Query Language) should look very familiar to you. Here is the reference for AWQL if you'd like to know more about it. Now, let's wrap our logic in a "main" function (required for AdWords Scripts) and iterate through the report we just pulled. For now, we'll just log the URLs and domains it pulls to the console:

```javascript
function main() {
  var report = AdWordsApp.report(
    'SELECT Url, Domain, Clicks, Impressions, Cost ' +
      'FROM   URL_PERFORMANCE_REPORT ' +
      'WHERE  Impressions > 0 ' +
      'DURING LAST_7_DAYS'
  )

  var rows = report.rows()
  while (rows.hasNext()) {
    var row = rows.next()
    var url = row['Url']
    var domain = row['Domain']
    Logger.log(url + ' - ' + domain)
  }
}
```

These are the pages where your ads have been showing for the last 7 days. Go ahead and take a look! If you use automatic placements, a lot of them are probably clickbait, fake news or otherwise sketchy websites. If you're concerned about brand integrity, you probably don't want your (or your client's) ads showing on at least a few of these.

Wit.ai is a startup that was acquired by Facebook in early 2015 that provides speech recognition and natural language processing for app developers. It works fairly well and, best of all, is free. If you'd prefer to keep everything under the Google umbrella, they have a similar offering called Dialogflow. We're going to use Wit.ai for our purposes.

Once you've gone over to Wit.ai and created an account, create an app. Don't do any training or anything just yet, we'll get to that. All you need to do is grab the server access token under the "API Details" section in the settings menu.

Now, let's start our Node.js backend that we'll deploy to Heroku (or the server of your choice) to use as our API. We're going to create an Express.js app. We're using body-parser here even though we really don't need it. Body-parser is used for handling POST requests, which we won't be doing in this particular example. But, this app can eventually have more than one endpoint and do more things than what we're doing here. You can use it as your own personal API:

1. None of the Node machine learning or language processing libraries will work in the AdWords Scripts environment. But they will obviously work in Node. You can build endpoints here to send data back and forth between the two.

2. If you want to use IBM's Watson API on the client side, you can't. They (rightfully) don't want your private keys to be accessible to anybody who visits your site. So, their use is restricted to server-side code. (This is a good thing as anybody could grab your key and rack up pricey API calls on your dime) Instead, you can have your client hit an endpoint here to call the API and get the data you want. This is a fairly common issue not specific to the Watson API. That's just an API one might use with AdWords data 😉. Dark Sky is another example that won't work with cross-origin requests.

The AdWords Scripts environment is rather restrictive in what you can and can't do. With your own personal Node backend, if you can do it in Node, you can do it in AdWords. Anyway, here's what our barebones Express app looks like:

```javascript
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.get('/api/hello-world', (req, res) => {
  res.send('hey buddy!')
})

const port = process.env.PORT || process.env.VCAP_APP_PORT || 3000
app.listen(port, () => {
  console.log('Server running at http://localhost:%s', port)
})
```

That's it! Running the server locally and hitting `localhost:3000/api/hello-world`endpoint should send back `hey buddy!` as a response.

We only need 2 more libraries to do what we want to do:

1. `node-tldr` is a library built to summarize articles when given a URL.
2. `node-wit` is the Node.js SDK for Wit.ai

With those installed, let's get to the meat of our code. We need to pull in the url from the request, use node-tldr to summarize the page, send the data to Wit.ai and send the response back to AdWords. A couple of gotchas to watch out for:

1. Sometimes the page will be very thin on content, use a client-side framework that won't send any data back to a server, or otherwise not have anything to summarize.
2. Wit.ai will throw an error if you send it a message with more than 280 characters. We need to make sure we don't do that.

For the first gotcha, we'll first try to send a combination of the title and summary of the page. If the summary or title is missing, we'll try sending just the summary. If the summary is missing, we'll just send the title. If the title is missing, we'll send an error back to AdWords and move on with our lives.

For the second gotcha, we'll make sure that whatever we send to Wit.ai doesn't exceed 280 characters by using the `.substring()` method. Here is the fully commented code for our placement bot (who I've affectionately named Chief Wiggum) route:

```javascript
app.get('/api/wiggum', (req, res) => {
  // Get the url from the query. Throw an error if undefined
  const url = req.query['url']
  if (url === undefined) res.status(500).send({ error: 'url is undefined' })
  // Initialize your Wit.ai client
  const client = new Wit({
    accessToken: YOUR_WIT_ACCESS_TOKEN,
    logger: new log.Logger(log.DEBUG),
  })
  // Use node-tldr to summarize the content of the url
  tldr.summarize(url, (result, err) => {
    if (err) {
      res.status(500).send(err)
    } else {
      // Set the message we want to send to Wit.ai
      let message = ''
      // Try using the title and summary together
      if (result.title !== '' && result.summary.length > 0) {
        message = `${result.title.substring(0, 59)}. ${result.summary
          .join(' ')
          .substring(0, 219)}`
        // Or just the summary
      } else if (result.summary.length > 0) {
        message = result.summary.join(' ').substring(0, 279)
        // Or just the title
      } else if (result.title !== '') {
        message = result.title.substring(0, 279)
      }
      // If the message never got set, send an error
      if (message === '') {
        res.status(500).send({ url, error: 'No title or summary' })
        // Otherwise, send the message to Wit.ai and send the response back to AdWords
      } else {
        client
          .message(message)
          .then(data => res.send({ url, ...data }))
          .catch(err => res.status(500).send(err))
      }
    }
  })
})
```

Now that we have our backend sorted out, let's go back to our AdWords Script. We'll take advantage of `UrlFetchApp.fetch()` to call our Node API. We need to attach the url we want to send as a url parameter. An example call might look like `https://{{ your url }}/api/wiggum?url=https://www.cnn.com/`. This should return a response that looks something like this:

```json
{
  "url": "https://www.cnn.com/",
  "_text": "Breaking News, Latest News and Videos",
  "entities": {
    "intent": [
      {
        "confidence": 0.996678055664,
        "value": "news"
      }
    ]
  },
  "msg_id": "0TnyzRqSKIkTbV9P9"
}
```

It looks like our bot correctly categorized CNN as news, despite what some people might think. Putting our API call into our script is pretty straightforward:

```javascript
var baseUrl = YOUR_BASE_URL
function main() {
  var report = AdWordsApp.report(
    'SELECT Url, Domain, Clicks, Impressions, Cost ' +
      'FROM   URL_PERFORMANCE_REPORT ' +
      'WHERE  Impressions > 0 ' +
      'DURING LAST_7_DAYS'
  )

  var rows = report.rows()
  while (rows.hasNext()) {
    var row = rows.next()
    var url = row['Url']
    var domain = row['Domain']
    var response = UrlFetchapp.fetch(
      baseUrl + '/api/wiggum?url=' + url
    ).getContentText()
    Logger.log(response)
  }
}
```

Once we get back the response, you will have to decide what to do with it. Right now we're just logging the result to the console. You could send yourself (or someone else) an email or, if you trust your bot enough, automatically exclude certain placements based on the response.

## Future improvements

This is a fairly simple implementation and could almost certainly be improved upon. For instance, you could use Headless Chrome instead of node-tldr's request/cheerio implementation to scrape the page. This would allow client-rendered frameworks to be scraped and could allow you to check for popups, among other things. Automatic summarization is an active area of machine learning research. A more state-of-the-art algorithm would probably outperform node-tldr's naive summarization. These are just a couple of ideas but if you have your own and you'd like to try implementing them, [the code is available on github](https://github.com/jafaircl/wiggum).

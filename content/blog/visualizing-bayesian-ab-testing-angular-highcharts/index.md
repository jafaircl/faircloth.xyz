---
title: Visualizing Bayesian A/B Testing in JavaScript with Angular and Highcharts
description: A/B Testing is a critical part of creating engaging websites and successful marketing campaigns. Learn to visualize the results using JavaScript in Angular and Highcharts.
featuredImage: ./default-logo.png
date: '2019-02-20T22:12:03.284Z'
tags: ['Angular', 'Highcharts', 'A/B Testing']
published: true
---

When most people think of A/B testing, they think of p-values and confidence intervals. This is known as the frequentist approach. [Michael Frasco at Convoy explains frequentist A/B testing very succinctly](https://medium.com/convoy-tech/the-power-of-bayesian-a-b-testing-f859d2219d5):

> In frequentist A/B testing, we use p-values to choose between two hypotheses: the null hypothesis — that there is no difference between variants A and B — and the alternative hypothesis — that variant B is different. A p-value measures the probability of observing a difference between the two variants at least as extreme as what we actually observed, given that there is no difference between the variants. Once the p-value achieves statistical significance or we’ve seen enough data, the experiment is over.

For frequentist A/B tests, no data outside the current test is considered. Bayesian testing introduces the ability to consider prior information when deciding between variants. Another advantage of Bayesian A/B testing is that you don't need to know your sample size ahead of time.

While I'll do my best to explain everything that's happening here, I'm not a statistician. If you have questions about [why you would Bayesian methods to conduct A/B testing](https://conversionxl.com/blog/bayesian-frequentist-ab-testing/) or [the math behind it](https://www.evanmiller.org/bayesian-ab-testing.html), I would suggest [one](https://nbviewer.jupyter.org/github/CamDavidsonPilon/Probabilistic-Programming-and-Bayesian-Methods-for-Hackers/blob/master/Chapter2_MorePyMC/Ch2_MorePyMC_PyMC2.ipynb) [of](http://varianceexplained.org/r/bayesian_ab_baseball/) [these](https://sl8r000.github.io/ab_testing_statistics//use_the_beta_distribution/) [articles](https://www.countbayesie.com/blog/2015/4/25/bayesian-ab-testing). The scope of this article is to show developers how to run the calculations necessary to make decisions about your tests and visualize the results.

## Getting started

First, we'll create our Angular application:

```sh
npm install -g @angular/cli
ng new bayesian-testing
cd bayesian-testing
```

We will also need `angular-highcharts` and `jStat` so let's run the following command from the root of our project:

```sh
npm install --save angular-highcharts highcharts jstat
```

To use Highcharts in our application, we will need to import it into the module where we plan to use it. If you're lazy loading your routes, you'll need to import it there. Since our example is simple and just uses the one route, we'll import it into `app.module.ts`:

```typescript
// app.module.ts

import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

// import the module
import { ChartModule } from 'angular-highcharts'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    // add it to our application imports
    ChartModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Getting our data

Now, we need to model the posterior distribution using jStat's beta distribution methods. The posterior distribution is a probability distribution that, given some data, shows how likely it is that the true value is in some window. The more data you have, the smaller your window will be. In order to plot this data, we will need to sample values from the beta distribution. The number of samples we draw is arbitrary. But, the more samples we have, the higher our graph's resolution will be.

There are several ways to go about drawing the samples. One way is to create an array (filled with 0s to avoid errors) and use the indices in `Array.map` to get the value of x in the Beta distribution at the index value. Since we are measuring click or conversion rates in A/B testing, we'll make sure the index is scaled to how many samples we're drawing. That may sound complicated but here's what it looks like:

```typescript
// app.component.ts

private getProbabilityDist(successes: number, trials: number, samples = 1000): number[][] {
  return new Array(samples)
    .fill(0)
    .map((_, i) => [
      (i / samples) * 100,
      jStat.beta.pdf(i / samples, successes + 1, trials - successes + 1)
    ]);
}
```

That's pretty much it! We now have a way to get x and y values for our probability distributions. Now we just need to give our user a way to update them and stick the values in a chart.

Let's create a `chart` variable in our `app.component.ts` file and write a method that will assign a Highchart chart to it when our method is called.

```typescript
import { Component } from '@angular/core'
import { Chart } from 'angular-highcharts'
import jStat from 'jstat'

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public chart: Chart

  constructor() {
    // initialize the chart with some values
    this.createChart(1, 10, 2, 10)
  }

  // our method to update or create our chart
  public createChart(
    successesA: number,
    trialsA: number,
    successesB: number,
    trialsB: number
  ): void {
    this.chart = new Chart({
      // give our chart some pretty colors
      colors: ['#0266C8', '#F90101'],
      // remove marker dots from the line that gets created in our chart
      plotOptions: {
        area: {
          marker: {
            enabled: false,
          },
        },
      },
      title: {
        text: '',
      },
      xAxis: [
        {
          title: { text: 'CTR (%)' },
          labels: {
            format: '{value}%',
          },
        },
      ],
      yAxis: [
        {
          title: { text: 'Density' },
        },
      ],
      series: [
        {
          name: 'a',
          type: 'area',
          // get the x and y values for A
          data: this.getProbabilityDist(
            parseInt(successesA),
            parseInt(trialsA)
          ),
        },
        {
          name: 'b',
          type: 'area',
          // get the x and y values for B
          data: this.getProbabilityDist(
            parseInt(successesB),
            parseInt(trialsB)
          ),
        },
      ],
    })
  }

  private getProbabilityDist(
    successes: number,
    trials: number,
    samples = 1000
  ): number[][] {
    return new Array(samples)
      .fill(0)
      .map((_, i) => [
        (i / samples) * 100,
        jStat.beta.pdf(i / samples, successes + 1, trials - successes + 1),
      ])
  }
}
```

Now all that's left to do is create our HTML file. We'll give our user a way to change the values and update the chart by using input fields and binding values to them using template reference variables (e.g. #successesA):

```html
<div [chart]="chart"></div>

<label> Successes for A <input #successesA value="1" type="number" /> </label>
<br />
<label> Trials for A <input #trialsA value="10" type="number" /> </label> <br />
<label> Successes for B <input #successesB value="2" type="number" /> </label>
<br />
<label> Trials for B <input #trialsB value="10" type="number" /> </label> <br />
<button
  (click)="createChart(successesA.value, trialsA.value, successesB.value, trialsB.value)"
>
  Update Chart
</button>
```

That's all! We can certainly make our inputs prettier but we now have a way to visualize our Bayesian A/B test results. See below for a working example:

<iframe src="https://stackblitz.com/edit/angular-ygejuj?embed=1&hideExplorer=1&view=preview" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" >

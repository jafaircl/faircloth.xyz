const postCssResponsiveType = require('postcss-responsive-type')

module.exports = {
  siteMetadata: {
    title: `faircloth.xyz`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `Jonathan Faircloth`,
    twitter: `@jafaircl`,
    siteUrl: `https://www.faircloth.xyz`,
    image: `./src/images/default-logo.png`,
  },
  plugins: [
    `gatsby-plugin-typescript`,
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        postCssPlugins: [postCssResponsiveType()],
        precision: 8,
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-webpack-bundle-analyzer`,
      options: {
        production: true,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/work`,
        name: `work`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          /*{
            resolve: 'gatsby-remark-embedded-codesandbox',
            options: {
              directory: `${__dirname}/examples/`,
              protocol: 'embedded-codesandbox://',
              // Customise Codesandbox embedding options:
              // https://codesandbox.io/docs/embedding#embed-options
              // default:
              embedOptions: {
                view: 'preview',
                hidenavigation: 1,
              },
            },
          },
           {
            resolve: 'gatsby-remark-code-repls',
            options: {
              directory: `${__dirname}/examples/`,
              // Optional path to a custom redirect template.
              // The redirect page is only shown briefly,
              // But you can use this setting to override its CSS styling.
              // redirectTemplate: `${__dirname}/src/redirect-template.js`,
              target: '_blank',
            },
          },,*/
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          `gatsby-remark-reading-time`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 960,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          // `gatsby-remark-katex`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `faircloth.xyz`,
        short_name: `fxyz`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#000000`,
        display: `minimal-ui`,
        icon: `src/images/favicon.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-twitter`,
    `gatsby-plugin-svgr`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.app/offline
    'gatsby-plugin-offline',
    {
      resolve: 'gatsby-plugin-htaccess',
      options: {
        https: true,
      },
    },
    /*{
      resolve: `gatsby-plugin-amp`,
      options: {
        analytics: {
          type: 'gtag',
          dataCredentials: 'include',
          config: {
            vars: {
              gtag_id: 'GTM-1234567',
              config: {
                'GTM-1234567': {
                  page_location: '{{pathname}}',
                },
              },
            },
          },
        },
        canonicalBaseUrl: 'https://www.faircloth.xyz/',
        components: ['amp-form'],
        excludedPaths: ['/404*', '/'],
        pathIdentifier: '/amp/',
        relAmpHtmlPattern: '{{canonicalBaseUrl}}{{pathname}}{{pathIdentifier}}',
        useAmpClientIdApi: true,
      },
    },*/
  ],
}

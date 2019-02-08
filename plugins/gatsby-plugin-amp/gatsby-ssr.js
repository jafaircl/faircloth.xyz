import React, { Fragment } from 'react'
import { renderToString } from 'react-dom/server'
import { Minimatch } from 'minimatch'
import flattenDeep from 'lodash.flattendeep'
const JSDOM = eval('require("jsdom")').JSDOM

const ampBoilerplate = `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`
const ampNoscriptBoilerplate = `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`

const interpolate = (str, map) =>
  str.replace(/{{\s*[\w\.]+\s*}}/g, match => map[match.replace(/[{}]/g, '')])

export const onPreRenderHTML = (
  {
    getHeadComponents,
    replaceHeadComponents,
    getPreBodyComponents,
    replacePreBodyComponents,
    getPostBodyComponents,
    replacePostBodyComponents,
    pathname,
  },
  {
    analytics,
    canonicalBaseUrl,
    components = [],
    includedPaths = [],
    excludedPaths = [],
    pathIdentifier = '/amp/',
    relAmpHtmlPattern = '{{canonicalBaseUrl}}{{pathname}}{{pathIdentifier}}',
  }
) => {
  const headComponents = flattenDeep(getHeadComponents())
  const preBodyComponents = getPreBodyComponents()
  const postBodyComponents = getPostBodyComponents()
  const isAmp = pathname && pathname.indexOf(pathIdentifier) > -1
  if (isAmp) {
    const styles = headComponents.reduce((str, x) => {
      if (x.type === 'style') {
        if (x.props.dangerouslySetInnerHTML) {
          str += x.props.dangerouslySetInnerHTML.__html
        }
      } else if (x.key && x.key === 'TypographyStyle') {
        str = `${x.props.typography.toString()}${str}`
      }
      return str
    }, '')
    replaceHeadComponents([
      <script async src="https://cdn.ampproject.org/v0.js" />,
      <style
        amp-boilerplate=""
        dangerouslySetInnerHTML={{ __html: ampBoilerplate }}
      />,
      <noscript>
        <style
          amp-boilerplate=""
          dangerouslySetInnerHTML={{ __html: ampNoscriptBoilerplate }}
        />
      </noscript>,
      <style amp-custom="" dangerouslySetInnerHTML={{ __html: styles }} />,
      ...components.map((x, i) => (
        <script
          key={`custom-element-${i}`}
          async
          custom-element={x}
          src={`https://cdn.ampproject.org/v0/${x}-0.1.js`}
        />
      )),
      analytics !== undefined ? (
        <script
          async
          custom-element="amp-analytics"
          src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"
        />
      ) : (
        <Fragment />
      ),
      ...headComponents.filter(
        x =>
          x.type !== 'style' &&
          x.type !== 'script' &&
          x.key !== 'TypographyStyle'
      ),
    ])
    replacePreBodyComponents([
      ...preBodyComponents.filter(x => x.key !== 'plugin-google-tagmanager'),
    ])
    replacePostBodyComponents(
      postBodyComponents.filter(x => x.type !== 'script')
    )
  } else if (
    (excludedPaths.length > 0 &&
      pathname &&
      excludedPaths.findIndex(_path => new Minimatch(pathname).match(_path)) <
        0) ||
    (includedPaths.length > 0 &&
      pathname &&
      includedPaths.findIndex(_path => new Minimatch(pathname).match(_path)) >
        -1) ||
    (excludedPaths.length === 0 && includedPaths.length === 0)
  ) {
    replaceHeadComponents([
      <link
        rel="amphtml"
        href={interpolate(relAmpHtmlPattern, {
          canonicalBaseUrl,
          pathIdentifier,
          pathname,
        }).replace(/([^:])(\/\/+)/g, '$1/')}
      />,
      ...headComponents,
    ])
  }
}

export const onRenderBody = (
  { setHeadComponents, setHtmlAttributes, setPreBodyComponents, pathname },
  {
    analytics,
    canonicalBaseUrl,
    pathIdentifier = '/amp/',
    relCanonicalPattern = '{{canonicalBaseUrl}}{{pathname}}',
    useAmpClientIdApi = false,
  }
) => {
  const isAmp = pathname && pathname.indexOf(pathIdentifier) > -1
  if (isAmp) {
    setHtmlAttributes({ amp: '' })
    setHeadComponents([
      <link
        rel="canonical"
        href={interpolate(relCanonicalPattern, {
          canonicalBaseUrl,
          pathname,
        })
          .replace(pathIdentifier, '')
          .replace(/([^:])(\/\/+)/g, '$1/')}
      />,
      useAmpClientIdApi ? (
        <meta name="amp-google-client-id-api" content="googleanalytics" />
      ) : (
        <Fragment />
      ),
    ])
    setPreBodyComponents([
      analytics != undefined ? (
        <amp-analytics
          type={analytics.type}
          data-credentials={analytics.dataCredentials}
          config={
            typeof analytics.config === 'string' ? analytics.config : undefined
          }
        >
          {typeof analytics.config === 'string' ? (
            <Fragment />
          ) : (
            <script
              type="application/json"
              dangerouslySetInnerHTML={{
                __html: interpolate(JSON.stringify(analytics.config), {
                  pathname,
                }),
              }}
            />
          )}
        </amp-analytics>
      ) : (
        <Fragment />
      ),
    ])
  }
}

export const replaceRenderer = (
  { bodyComponent, replaceBodyHTMLString, setHeadComponents, pathname },
  { pathIdentifier = '/amp/' }
) => {
  const defaults = {
    image: {
      width: 640,
      height: 475,
      layout: 'responsive',
    },
    iframe: {
      width: 640,
      height: 475,
      layout: 'responsive',
    },
  }
  const headComponents = []
  const isAmp = pathname && pathname.indexOf(pathIdentifier) > -1
  if (isAmp) {
    const bodyHTML = renderToString(bodyComponent)
    const dom = new JSDOM(bodyHTML)
    const document = dom.window.document

    // convert images to amp-img or amp-anim
    const images = [].slice.call(document.getElementsByTagName('img'))
    images.forEach(image => {
      let ampImage
      if (image.src && image.src.indexOf('.gif') > -1) {
        ampImage = document.createElement('amp-anim')
        headComponents.push('amp-anim')
      } else {
        ampImage = document.createElement('amp-img')
      }
      const attributes = Object.keys(image.attributes)
      const includedAttributes = attributes.map(key => {
        const attribute = image.attributes[key]
        ampImage.setAttribute(attribute.name, attribute.value)
        return attribute.name
      })
      Object.keys(defaults.image).forEach(key => {
        if (includedAttributes && includedAttributes.indexOf(key) === -1) {
          ampImage.setAttribute(key, defaults.image[key])
        }
      })
      image.parentNode.replaceChild(ampImage, image)
    })

    // convert iframes to amp-iframe
    const iframes = [].slice.call(document.getElementsByTagName('iframe'))
    iframes.forEach(iframe => {
      headComponents.push('amp-iframe')
      const ampIframe = document.createElement('amp-iframe')
      const attributes = Object.keys(iframe.attributes)
      const includedAttributes = attributes.map(key => {
        const attribute = iframe.attributes[key]
        ampIframe.setAttribute(attribute.name, attribute.value)
        return attribute.name
      })
      Object.keys(defaults.iframe).forEach(key => {
        if (includedAttributes && includedAttributes.indexOf(key) === -1) {
          ampIframe.setAttribute(key, defaults.iframe[key])
        }
      })
      iframe.parentNode.replaceChild(ampIframe, iframe)
    })
    setHeadComponents(
      Array.from(new Set(headComponents)).map((x, i) => (
        <Fragment key={`head-components-${i}`}>
          <script
            async
            custom-element={x}
            src={`https://cdn.ampproject.org/v0/${x}-0.1.js`}
          />
        </Fragment>
      ))
    )
    replaceBodyHTMLString(document.documentElement.outerHTML)
  }
}

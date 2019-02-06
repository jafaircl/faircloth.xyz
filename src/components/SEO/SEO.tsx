import React, { FunctionComponent } from 'react'
import Helmet from 'react-helmet'
import { graphql, StaticQuery } from 'gatsby'

const query = graphql`
  query SeoDefaultsQuery {
    site {
      siteMetadata {
        title
        description
        image
      }
    }
    imageSharp(original: { src: { regex: "/default-logo/" } }) {
      fixed {
        src
      }
    }
  }
`

interface SEO {
  title?: string
  description?: string
  image?: string
  lang?: string
  prefix?: string
  htmlClass?: string
}

interface SeoDefaultsQuery {
  site: {
    siteMetadata: {
      title: string
      description: string
      image: string
    }
  }
  imageSharp: {
    fixed: {
      src: string
    }
  }
}

export const SEO: FunctionComponent<SEO> = ({
  title,
  description,
  image,
  lang = 'en',
  prefix = 'og: http://ogp.me/ns#',
}) => (
  <StaticQuery
    query={query}
    render={({
      site: {
        siteMetadata: { title: defaultTitle, description: defaultDescription },
      },
      imageSharp: {
        fixed: { src: defaultImage },
      },
    }: SeoDefaultsQuery) => {
      const _title = title ? title : defaultTitle
      const _description = description ? description : defaultDescription
      const _image = image ? image : defaultImage
      return (
        <Helmet
          title={_title}
          htmlAttributes={{ lang, prefix }}
          meta={[
            {
              name: `description`,
              content: _description,
            },
            {
              property: `og:title`,
              content: _title,
            },
            {
              property: `og:description`,
              content: _description,
            },
            {
              property: `og:image`,
              content: _image,
            },
            {
              property: `og:type`,
              content: `website`,
            },
            {
              name: `twitter:card`,
              content: `summary_large_image`,
            },
            {
              name: `twitter:creator`,
              content: `@jafaircl`,
            },
            {
              name: `twitter:title`,
              content: _title,
            },
            {
              name: `twitter:description`,
              content: _description,
            },
            {
              name: `twitter:image`,
              content: _image,
            },
          ]}
        />
      )
    }}
  />
)

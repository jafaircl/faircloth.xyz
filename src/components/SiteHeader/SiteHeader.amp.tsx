import React, { FunctionComponent } from 'react'
import { graphql, Link, StaticQuery } from 'gatsby'

import styles from './SiteHeader.amp.module.scss'

const query = graphql`
  query AmpSiteTitleQuery {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`

interface SiteTitleQuery {
  site: {
    siteMetadata: {
      title: string
      description: string
    }
  }
}

export const SiteHeader: FunctionComponent<{ siteTitle?: string }> = () => {
  return (
    <StaticQuery
      query={query}
      render={({
        site: {
          siteMetadata: { title, description },
        },
      }: SiteTitleQuery) => (
        <header className={`siteHeader`}>
          <section className={styles.siteHeaderToolbar}>
            <Link to={'/'}>{title}</Link>
            <span className={styles.flexSpacer} />
          </section>
        </header>
      )}
    />
  )
}

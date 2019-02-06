import React, { FunctionComponent } from 'react'
import { graphql, Link, StaticQuery } from 'gatsby'

import { fromEvent, animationFrameScheduler, Observable, of } from 'rxjs'
import {
  distinctUntilChanged,
  map,
  pairwise,
  throttleTime,
  share,
  filter,
  switchMap,
} from 'rxjs/operators'
import { useObservable } from 'rxjs-hooks'

import ThemeToggle from '../ThemeToggle'

import styles from './SiteHeader.module.scss'
// import './SiteHeader.scss'

const query = graphql`
  query SiteTitleQuery {
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

const watchScrollPosition: Observable<number> = of(
  typeof window !== 'undefined'
).pipe(
  filter(Boolean),
  switchMap(() => fromEvent(window, 'scroll', { passive: true })),
  throttleTime(0, animationFrameScheduler),
  map(() => window.pageYOffset),
  share()
)

const watchScrollDirection: Observable<string> = watchScrollPosition.pipe(
  filter(y => y > 64),
  pairwise(),
  map(([y1, y2]) => (y2 < y1 ? 'Up' : 'Down')),
  distinctUntilChanged()
)

export const SiteHeader: FunctionComponent<{ siteTitle?: string }> = () => {
  const scrollPosition: number = useObservable(() => watchScrollPosition, 0)
  const scrollDirection: string = useObservable(
    () => watchScrollDirection,
    'Up'
  )

  return (
    <StaticQuery
      query={query}
      render={({
        site: {
          siteMetadata: { title, description },
        },
      }: SiteTitleQuery) => (
        <header
          className={`${styles.siteHeader} ${
            scrollPosition < 10 ? styles.siteHeaderTop : ''
          } ${
            scrollDirection === 'Up' ? styles.siteHeaderStuck : ''
          } siteHeader`}
        >
          <section className={styles.siteHeaderToolbar}>
            <Link to={'/'}>{title}</Link>
            <span className={styles.flexSpacer} />
            <ThemeToggle />
          </section>
        </header>
      )}
    />
  )
}

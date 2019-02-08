import React, { FunctionComponent } from 'react'
import { Link } from 'gatsby'

import { SiteHeader } from '../SiteHeader/SiteHeader.amp'
import { SiteFooter } from '../SiteFooter/SiteFooter.amp'
import styles from './Layout.amp.module.scss'
// import './layout.scss'

export const Layout: FunctionComponent = ({ children }) => (
  <>
    <SiteHeader />

    <main className={styles.mainContent}>{children}</main>
    <nav className={styles.siteNav}>
      <ul className={styles.siteNavList}>
        <li key="1">
          <Link to={`/blog`}>Blog</Link>
        </li>
        <li key="2">
          <Link to={`/work`}>Work</Link>
        </li>
      </ul>
    </nav>
    <SiteFooter />
  </>
)

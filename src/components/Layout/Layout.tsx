import React, { FunctionComponent } from 'react'
import { Link } from 'gatsby'

import SiteHeader from '../SiteHeader'
import SiteFooter from '../SiteFooter'
import styles from './Layout.module.scss'
// import './layout.scss'

export const Layout: FunctionComponent = ({ children }) => (
  <>
    <SiteHeader />
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
    <main className={styles.mainContent}>{children}</main>
    <SiteFooter />
  </>
)

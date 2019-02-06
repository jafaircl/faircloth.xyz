import React from 'react'

import { useObservable, useEventCallback } from 'rxjs-hooks'

import { theme$ } from '../ThemeToggle/ThemeToggle'

import styles from './SiteFooter.module.scss'
import './SiteFooter.scss'

import { ReactComponent as Github } from '../../images/github.svg'
import { ReactComponent as LinkedIn } from '../../images/linkedin.svg'
import { ReactComponent as Twitter } from '../../images/twitter.svg'

import profile from '../../images/profile.jpg'

export const SiteFooter = () => {
  const theme = useObservable(
    () => theme$,
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('theme') || 'light'
      : 'light'
  )
  return (
    <footer className={styles.siteFooter}>
      <ul className={styles.footerList}>
        <li className={styles.footerListItem} key="1">
          <a
            aria-label="Github profile"
            target="_blank"
            href="https://github.com/jafaircl"
            rel="noopener"
          >
            <Github fill={theme === 'light' ? '#000' : '#fff'} />
          </a>
        </li>
        <li className={styles.footerListItem} key="2">
          <a
            aria-label="LinkedIn profile"
            target="_blank"
            href="https://www.linkedin.com/in/jonathanfaircloth/"
            rel="noopener"
          >
            <LinkedIn fill={theme === 'light' ? '#000' : '#fff'} />
          </a>
        </li>
        <li className={styles.footerListItem} key="3">
          <a
            aria-label="Twitter profile"
            target="_blank"
            href="https://twitter.com/jafaircl"
            rel="noopener"
          >
            <Twitter fill={theme === 'light' ? '#000' : '#fff'} />
          </a>
        </li>
      </ul>
      <p>©{new Date().getFullYear()}</p>
    </footer>
  )
}

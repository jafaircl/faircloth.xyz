import React from 'react'

import { ReplaySubject, Observable } from 'rxjs'
import { map, filter, tap } from 'rxjs/operators'

import { useEventCallback } from 'rxjs-hooks'

import Toggle from 'react-toggle'
import BodyClassName from 'react-body-classname'

import styles from './ThemeToggle.module.scss'
import './ThemeToggle.scss'

export const theme$ = new ReplaySubject(null)

const themeEventCallback = ($event: Observable<Event>) =>
  $event.pipe(
    map(() => typeof window !== 'undefined'),
    filter(Boolean),
    tap(() => {
      if (localStorage.getItem('theme') === 'light') {
        localStorage.setItem('theme', 'dark')
        theme$.next('dark')
      } else {
        localStorage.setItem('theme', 'light')
        theme$.next('light')
      }
    }),
    map(() => localStorage.getItem('theme'))
  )

export const ThemeToggle = () => {
  if (
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('theme') === null
  ) {
    localStorage.setItem('theme', 'light')
    theme$.next('light')
  }
  const [themeChangeCallback, theme] = useEventCallback(
    themeEventCallback,
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('theme')
      : 'light'
  )
  return (
    <>
      <BodyClassName className={`${styles[`${theme}Theme`]} ${theme}`} />
      <label htmlFor="theme-toggle">
        <span className="react-toggle-screenreader-only">Theme toggle</span>
        <Toggle
          id="theme-toggle"
          aria-label="theme toggle"
          className={'themeToggle'}
          defaultChecked={theme === 'dark'}
          icons={{
            checked: (
              <span role="img" aria-label="flame">
                😎
              </span>
            ),
            unchecked: (
              <span role="img" aria-label="flame">
                🤓
              </span>
            ),
          }}
          onChange={themeChangeCallback}
        />
      </label>
    </>
  )
}

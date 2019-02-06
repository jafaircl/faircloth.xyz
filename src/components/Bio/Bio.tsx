import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'

import styles from './Bio.module.scss'

const query = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/profile.jpg/" }) {
      childImageSharp {
        fixed(width: 50, height: 50) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`

export const Bio = () => (
  <StaticQuery
    query={query}
    render={data => (
      <section className={styles.bioWrap}>
        <Image
          fixed={data.avatar.childImageSharp.fixed}
          alt={`Jonathan Faircloth`}
          className={styles.avatar}
        />
        <p>Personal blog by Jonathan Faircloth</p>
      </section>
    )}
  />
)

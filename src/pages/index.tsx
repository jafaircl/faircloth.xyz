import React from 'react'
import { Link, graphql } from 'gatsby'

import Typist from 'react-typist'

import Layout from '../components/Layout'
import SEO from '../components/SEO'

import styles from './index.module.scss'

export const pageQuery = graphql`
  query IndexPageQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          id
          excerpt
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
          }
          fields {
            slug
          }
        }
      }
    }
  }
`

interface BlogPost {
  node: {
    id: string
    excerpt: string
    frontmatter: { date: string; title: string }
    fields: {
      slug: string
    }
  }
}

interface IndePageProps {
  data: {
    allMarkdownRemark: {
      edges: BlogPost[]
    }
  }
}

export default ({ data }: IndePageProps) => {
  return (
    <Layout>
      <SEO title="Home | faircloth.xyz" />
      <h1>
        Hi, I'm Jonathan <span>👋</span>
      </h1>
      <Typist className={styles.typist}>
        <span> I make Angular apps </span>
        <Typist.Backspace count={13} delay={400} />
        <span> React apps </span>
        <Typist.Backspace count={11} delay={300} />
        <span> Node.js apps </span>
        <Typist.Backspace count={13} delay={400} />
        <span> Tensorflow apps </span>
        <Typist.Backspace count={16} delay={300} />
        <span> stuff. Check it out ☝️ </span>
      </Typist>
    </Layout>
  )
}

/*
<ul className={styles.indexPageWrap}>
        {data.allMarkdownRemark.edges.map(
          ({
            node: { frontmatter },
            node: { id },
            node: {
              fields: { slug },
            },
          }: BlogPost) => (
            <li key={id}>
              <Link to={slug}>
                <h2 className={styles.postTitle}>{frontmatter.title}</h2>
                <p className={styles.postDate}>{frontmatter.date}</p>
              </Link>
            </li>
          )
        )}
      </ul>
      */

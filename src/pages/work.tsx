import React from 'react'
import { Link, graphql } from 'gatsby'

import Layout from '../components/Layout'
import SEO from '../components/SEO'

import styles from './work.module.scss'

export const pageQuery = graphql`
  query WorkPageQuery {
    site {
      siteMetadata {
        title
      }
    }
    allFile(
      filter: { sourceInstanceName: { eq: "work" }, extension: { eq: "md" } }
    ) {
      edges {
        node {
          id
          childMarkdownRemark {
            excerpt
            frontmatter {
              date(formatString: "MMMM DD, YYYY")
              dateSort: date(formatString: "YYYYMMDD")
              title
              published
              tags
            }
            fields {
              slug
            }
          }
        }
      }
    }
  }
`

interface WorkPost {
  node: {
    id: string
    childMarkdownRemark: {
      excerpt: string
      frontmatter: {
        date: string
        dateSort: string
        title: string
        published: boolean
        tags: string[]
      }
      fields: {
        slug: string
      }
    }
  }
}

interface WorkPageProps {
  data: {
    allFile: {
      edges: WorkPost[]
    }
  }
}

export default ({ data }: WorkPageProps) => {
  return (
    <Layout>
      <SEO title="Work | faircloth.xyz" url="https://www.faircloth.xyz/work/" />
      <ul className={styles.workPageWrap}>
        {data.allFile.edges
          .filter(
            ({
              node: {
                childMarkdownRemark: {
                  frontmatter: { published },
                },
              },
            }) => !!published
          )
          .sort(
            (
              {
                node: {
                  childMarkdownRemark: {
                    frontmatter: { dateSort: dateA },
                  },
                },
              },
              {
                node: {
                  childMarkdownRemark: {
                    frontmatter: { dateSort: dateB },
                  },
                },
              }
            ) => parseInt(dateB) - parseInt(dateA)
          )
          .map(
            ({
              node: {
                childMarkdownRemark: { frontmatter },
              },
              node: { id },
              node: {
                childMarkdownRemark: {
                  fields: { slug },
                },
              },
            }: WorkPost) => (
              <li key={id}>
                <Link to={slug}>
                  <h2 className={styles.postTitle}>{frontmatter.title}</h2>
                  <p className={styles.postDate}>
                    {frontmatter.tags.join(' · ')}
                  </p>
                </Link>
              </li>
            )
          )}
      </ul>
    </Layout>
  )
}

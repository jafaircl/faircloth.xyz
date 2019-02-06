import React from 'react'
import { Link, graphql } from 'gatsby'

import Layout from '../components/Layout'
import SEO from '../components/SEO'

import styles from './blog.module.scss'

export const pageQuery = graphql`
  query BlogPageQuery {
    site {
      siteMetadata {
        title
      }
    }
    allFile(
      filter: { sourceInstanceName: { eq: "blog" }, extension: { eq: "md" } }
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

interface BlogPost {
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

interface BlogPageProps {
  data: {
    allFile: {
      edges: BlogPost[]
    }
  }
}

export default ({ data }: BlogPageProps) => {
  return (
    <Layout>
      <SEO title="Blog | faircloth.xyz" />
      <ul className={styles.blogPageWrap}>
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
            }: BlogPost) => (
              <li key={id}>
                <Link to={slug}>
                  <h2 className={styles.postTitle}>{frontmatter.title}</h2>
                  <p className={styles.postDate}>{frontmatter.date}</p>
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

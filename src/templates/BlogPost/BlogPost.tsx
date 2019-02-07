import { graphql, Link } from 'gatsby'
import React, { FunctionComponent } from 'react'
import Layout from '../../components/Layout'
import SEO from '../../components/SEO'
import Bio from '../../components/Bio'

import styles from './BlogPost.module.scss'

interface BlogPostProps {
  data: {
    site: {
      siteMetadata: {
        title: string
        author: string
        siteUrl: string
        twitter: string
      }
    }
    markdownRemark: {
      id: string
      excerpt: string
      html: string
      frontmatter: {
        title: string
        description: string
        featuredImage: any
        date: string
        dateProp: string
        tags: string[]
      }
      fields: {
        slug: string
        readingTime: {
          text: string
        }
      }
    }
  }
  pageContext: {
    previous: any
    next: any
  }
}

export const BlogPost: FunctionComponent<BlogPostProps> = ({
  data: { markdownRemark: post },
  data: {
    site: { siteMetadata },
  },
}) => (
  <Layout>
    <SEO
      title={`${post.frontmatter.title} | faircloth.xyz`}
      description={post.frontmatter.description}
      image={`${siteMetadata.siteUrl}/${
        post.frontmatter.featuredImage.childImageSharp.sizes.src
      }`.replace(/([^:]\/)\/+/g, '$1')}
      url={`${siteMetadata.siteUrl}/${post.fields.slug}`.replace(
        /([^:]\/)\/+/g,
        '$1'
      )}
    />
    <article className={styles.blogPostWrap}>
      <header>
        <h1>{post.frontmatter.title}</h1>
        <ul className={styles.blogPostInfo}>
          <li>
            <time dateTime={post.frontmatter.dateProp}>
              {post.frontmatter.date}
            </time>
          </li>
          <li>&middot;</li>
          <li>{post.fields.readingTime.text}</li>
        </ul>
        <p className={styles.blogPostInfo}>
          {post.frontmatter.tags.join(' · ')}
        </p>
      </header>
      <main
        className={styles.blogPostContent}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
      <footer>
        <a
          target="_blank"
          rel="noopener"
          href={`https://mobile.twitter.com/search?q=${siteMetadata.siteUrl}/${
            post.fields.slug
          }`.replace(/([^:]\/)\/+/g, '$1')}
        >
          Discuss this article on twitter
        </a>
        <Bio />
      </footer>
    </article>
  </Layout>
)

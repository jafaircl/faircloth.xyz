import { graphql } from 'gatsby'
import { AmpBlogPost } from './BlogPost.amp'

export const pageQuery = graphql`
  query AmpBlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        siteUrl
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        description
        featuredImage {
          childImageSharp {
            sizes(maxWidth: 630) {
              ...GatsbyImageSharpSizes
            }
          }
        }
        date(formatString: "MMMM DD, YYYY")
        dateProp: date(formatString: "YYYY-MM-DD")
        tags
      }
      fields {
        slug
        readingTime {
          text
        }
      }
    }
  }
`

export default AmpBlogPost

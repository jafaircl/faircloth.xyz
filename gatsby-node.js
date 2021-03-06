const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

const fs = require('fs')
const zlib = require('zlib')
const iltorb = require('iltorb')
const glob = require('glob')

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {
            allMarkdownRemark(
              sort: { fields: [frontmatter___date], order: DESC }
              limit: 1000
            ) {
              edges {
                node {
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }

        // Create blog posts pages.
        const posts = result.data.allMarkdownRemark.edges

        posts.forEach((post, index) => {
          const previous =
            index === posts.length - 1 ? null : posts[index + 1].node
          const next = index === 0 ? null : posts[index - 1].node

          createPage({
            path: post.node.fields.slug,
            component: path.resolve('./src/templates/BlogPost/index.ts'),
            context: {
              slug: post.node.fields.slug,
              previous,
              next,
            },
          })

          createPage({
            path: `${post.node.fields.slug}/amp/`.replace(/([^:]\/)\/+/g, '$1'),
            component: path.resolve('./src/templates/AmpBlogPost/index.ts'),
            context: {
              slug: post.node.fields.slug,
              previous,
              next,
            },
          })
        })
      })
    )
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

exports.onPostBuild = () =>
  new Promise((resolve, reject) => {
    try {
      const publicPath = path.join(__dirname, 'public')
      const gzippable = glob.sync(`${publicPath}/**/?(*.html|*.js|*.css|*.svg)`)
      gzippable.forEach(file => {
        const content = fs.readFileSync(file)
        const zipped = zlib.gzipSync(content)
        fs.writeFileSync(`${file}.gz`, zipped)

        const brotlied = iltorb.compressSync(content)
        fs.writeFileSync(`${file}.br`, brotlied)
      })
    } catch (e) {
      reject(new Error('onPostBuild: Could not compress the files'))
    }

    resolve()
  })

const urljoin = require('url-join')
const config = require('./_site-config')
const isDevelopment = process.env.NODE_ENV !== `production`

/* hot module reloading for CSS variables */
const postcssFile = require.resolve('./postcss.config.js')
const postcssPlugins = (webpackInstance) => {
  const varFile = require.resolve('./src/_variables.js')
  const varFileContents = () => {
    webpackInstance.addDependency(varFile)
    delete require.cache[varFile]
    return require(varFile)
  }
  webpackInstance.addDependency(postcssFile)
  delete require.cache[postcssFile]
  return require(postcssFile)({}, varFileContents())
}

module.exports = {
  pathPrefix: config.pathPrefix,
  siteMetadata: {
    siteUrl: urljoin(config.siteUrl, config.pathPrefix),
    rssMetadata: {
      site_url: urljoin(config.siteUrl, config.pathPrefix),
      feed_url: urljoin(config.siteUrl, config.pathPrefix, config.siteRss),
      title: config.siteTitle,
      description: config.siteDescription,
      image_url: `${urljoin(config.siteUrl, config.pathPrefix)}/logos/logo-512.png`,
      author: config.userName,
      copyright: config.copyright
    }
  },
  plugins: [
    {
      resolve: 'gatsby-route-plugin',
      options: {
        debug: true
      }
    },
    {
      resolve: 'gatsby-plugin-analytics',
      options: {
        debug: true
      }
    },
    {
      resolve: 'gatsby-plugin-sentry',
      options: {
        dsn: 'https://0ac0846560964da9b6653b8e3e3dd589@sentry.io/1455514',
        // Optional settings, see https://docs.sentry.io/clients/node/config/#optional-settings
        environment: process.env.NODE_ENV,
        enabled: (() => ['production', 'stage'].indexOf(process.env.NODE_ENV) !== -1)()
      }
    },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-lodash',
    // https://github.com/gatsbyjs/gatsby/pull/8496/files
    // {
    //   resolve: `gatsby-plugin-react-css-modules`,
    //   options: {
    //     generateScopedName: isDevelopment ? `[name]--[local]--[hash:base64:5]` : `[hash:base64:5]`,
    //   },
    // },
    {
      resolve: 'gatsby-better-postcss',
      options: {
        cssMatch: 'hi',
        postCssPlugins: postcssPlugins,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'assets',
        path: `${__dirname}/static/`
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'posts',
        path: `${__dirname}/content/`
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 690
            }
          },
          {
            resolve: 'gatsby-remark-responsive-iframe'
          },
          'gatsby-remark-prismjs',
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-autolink-headers'
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-nprogress',
      options: {
        color: config.themeColor
      }
    },
    'gatsby-plugin-sharp',
    'gatsby-plugin-catch-links',
    'gatsby-plugin-twitter',
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: config.siteTitle,
        short_name: config.siteTitleShort,
        description: config.siteDescription,
        start_url: config.pathPrefix,
        background_color: config.backgroundColor,
        theme_color: config.themeColor,
        display: 'minimal-ui',
        icons: [
          {
            src: '/logos/logo-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logos/logo-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },
    // 'gatsby-plugin-offline',
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        setup(ref) {
          const ret = ref.query.site.siteMetadata.rssMetadata
          ret.allMarkdownRemark = ref.query.allMarkdownRemark
          ret.generator = 'GatsbyJS Material Starter'
          return ret
        },
        query: `
        {
          site {
            siteMetadata {
              rssMetadata {
                site_url
                feed_url
                title
                description
                image_url
                author
                copyright
              }
            }
          }
        }
      `,
        feeds: [
          {
            serialize(ctx) {
              const { rssMetadata } = ctx.query.site.siteMetadata
              return ctx.query.allMarkdownRemark.edges.map(edge => ({
                categories: edge.node.frontmatter.tags,
                date: edge.node.fields.date,
                title: edge.node.frontmatter.title,
                description: edge.node.excerpt,
                author: rssMetadata.author,
                url: rssMetadata.site_url + edge.node.fields.slug,
                guid: rssMetadata.site_url + edge.node.fields.slug,
                custom_elements: [{ 'content:encoded': edge.node.html }]
              }))
            },
            query: `
            {
              allMarkdownRemark(
                limit: 1000,
                sort: { order: DESC, fields: [fields___date] },
              ) {
                edges {
                  node {
                    excerpt
                    html
                    timeToRead
                    fields {
                      slug
                      date
                    }
                    frontmatter {
                      title
                      cover
                      date
                      category
                      tags
                    }
                  }
                }
              }
            }
          `,
            output: config.siteRss
          }
        ]
      }
    }
  ]
}

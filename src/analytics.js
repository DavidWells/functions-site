import Analytics from 'analytics'
import segmentPlugin from 'analytics-plugin-segment'
import customerIoPlugin from 'analytics-plugin-customerio'
import gtagManagerPlugin from 'analytics-plugin-google-tag-manager'

// Temp functions for clean URL
function canonicalUrl() {
  if (typeof window === 'undefined') return
  const tags = document.getElementsByTagName('link')
  for (var i = 0, tag; tag = tags[i]; i++) {
    if (tag.getAttribute('rel') === 'canonical') {
      return tag.getAttribute('href')
    }
  }
}

function paramsClean(url, param) {
  const search = (url.split('?') || [ , ])[1]
  if (!search || search.indexOf(param) === -1) {
    return url
  }
  // remove all utm params from URL search
  const regex = new RegExp(`(\\&|\\?)${param}([_A-Za-z0-9"+=\.%]+)`, 'g')
  const cleanSearch = `?${search}`.replace(regex, '').replace(/^&/, '?')
  // replace search params with clean params
  const cleanURL = url.replace(`?${search}`, cleanSearch)
  // use browser history API to clean the params
  return cleanURL
}

function currentUrl(search) {
  const canonical = canonicalUrl()
  if (!canonical) return window.location.href.replace(/#.*$/, '')
  return canonical.match(/\?/) ? canonical : `${canonical}${search}`
}

const analytics = Analytics({
  plugins: [
    gtagManagerPlugin({
      containerId: 'GTM-NMKKF2M'
    }),
    segmentPlugin({
      writeKey: 'f3W8BZ0iCGrk1STIsMZV7JXfMGB7aMiW',
      disableAnonymousTraffic: true,
    }),
    customerIoPlugin({
      siteId: '4dfdba9c7f1a6d60f779'
    }),
    // custome netlify analytics
    {
      NAMESPACE: 'netlify-analytics-plugin',
      page: ({ payload }) => {
        const { properties, meta } = payload
        const cleanUrl = currentUrl(properties.search)
        console.log('cleanUrl', cleanUrl)
        const urlNoUtm = paramsClean(cleanUrl, 'utm')
        console.log('urlNoUtm', urlNoUtm)
        const data = {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            date: meta.timestamp || new Date().getTime(),
            name: properties.title || document.title,
            url: urlNoUtm,
            website: 'functions'
          }),
        }
        if (window.location.origin === 'https://functions.netlify.com') {
          fetch('https://gr4ziaod9h.execute-api.us-west-1.amazonaws.com/prod/track', data)
        }
      }
    },
    {
      NAMESPACE: 'test-plugin',
      page: (d) => {
        console.log('page view', d)
      }
    }
  ]
})

analytics.on('page', ({ payload }) => {
  console.log('page', payload)
})

analytics.on('track', ({ payload }) => {
  console.log('track', payload)
})

// Set to global so analytics plugin will work
if (typeof window !== 'undefined') {
  window.Analytics = analytics
}

export default analytics

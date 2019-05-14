import Analytics from 'analytics'
import segmentPlugin from 'analytics-plugin-segment'
import customerIoPlugin from 'analytics-plugin-customerio'
import gtagManagerPlugin from 'analytics-plugin-google-tag-manager'

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
        const data = {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            date: payload.meta.timestamp,
            name: document.title,
            url: payload.url,
            website: 'functions'
          }),
        }
        fetch('https://gr4ziaod9h.execute-api.us-west-1.amazonaws.com/prod/track', data)
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

import React from 'react'
import Icon from '../../components/Icon'
import '../index.css'

if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) { // eslint-disable-line
      registration.unregister()
    }
  })
}

export default class Base extends React.Component {
  componentDidMount () {
    Icon.loadSprite()
  }
  render() {
    const { children, className } = this.props
    return (
      <div className={className}>
        {children}
      </div>
    )
  }
}

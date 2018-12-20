import React from 'react'
import styles from './SearchBox.css'

const SearchBox = (props) => {
  return (
    <div className={styles.searchBox}>
      <div className={styles.icon}></div>
      <input
        onChange={props.onChange}
        placeholder={props.placeholder}
      />
    </div>
  )
}

export default SearchBox
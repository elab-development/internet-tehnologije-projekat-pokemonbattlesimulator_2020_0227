import React from 'react'
import { getRandomImage } from './assets/loadingPageAssets/loadingImages'

const LoadingPage = () => {
  return (
    <div className='loading-page'>
      <img src={getRandomImage()}></img>
      <p>Loading...</p>
    </div>
  )
}

export default LoadingPage
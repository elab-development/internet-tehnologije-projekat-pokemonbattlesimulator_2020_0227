import React from 'react'
import { getRandomImage } from './assets/loadingPageAssets/loadingImages'
import './css/Util/LoadingPage.scss'

const LoadingPage = () => {
  return (
    <div className='loading-page'>
      <img src={getRandomImage()} alt=""></img>
      <p>Loading...</p>
    </div>
  )
}

export default LoadingPage
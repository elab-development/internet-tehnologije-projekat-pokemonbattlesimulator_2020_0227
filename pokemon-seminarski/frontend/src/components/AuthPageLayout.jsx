import React from 'react'
import { AnimatePresence } from 'framer-motion'
import AnimationOutlet from './utils/AnimationOutlet'
import { useLocation } from 'react-router-dom'
import './css/NoAuth/Layout.scss'

const AuthPageLayout = () => {
  let location = useLocation();

  return (
    <div className='auth-page'>
      <div className='auth-page-card'>
        <AnimatePresence mode='wait'>
          <AnimationOutlet key={location.key} />
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AuthPageLayout
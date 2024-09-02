import React from 'react'
import { AnimatePresence } from 'framer-motion'
import AnimationOutlet from './utils/AnimationOutlet'
import { useLocation } from 'react-router-dom'


const AuthPageLayout = () => {
  let location = useLocation();

  return (
    <div className='auth-page'>
      <AnimatePresence mode='wait'>
        <AnimationOutlet key={location.key} />
      </AnimatePresence>
    </div>
  )
}

export default AuthPageLayout
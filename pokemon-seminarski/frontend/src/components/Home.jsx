import React from 'react'
import { socket } from './sockets/sockets'

const Home = () => {

  return (
    <div className='three-column-layout'>
      <div className='first-column'></div>
      <div className='second-column'>
        <Chat/>
      </div>
      <div className='third-column'></div>
    </div>
  )
}

export default Home
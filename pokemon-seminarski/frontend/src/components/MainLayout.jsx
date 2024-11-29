import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
    return (
        <div className='main-layout'>
            <Header />
            <Outlet />
            <Footer />
        </div>
    )
}

export default MainLayout
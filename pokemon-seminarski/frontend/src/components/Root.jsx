import React, { createContext, Suspense, useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../contexts/UserContextProvider'
import API from './utils/API';
import { Await, defer, Outlet, useLoaderData } from 'react-router-dom';
import LoadingPage from './LoadingPage';
import ErrorOffline from './ErrorOffline';
import Setup from './Setup';

export const rootLoader = () => {
    const data = API.post('/login', undefined, { validateStatus: status => status < 500 });

    return defer({
        data: data
    });
}


const Root = () => {
    const data = useLoaderData();
    return (
        <Suspense fallback={<LoadingPage />}>
            <Await resolve={data} errorElement={<ErrorOffline />}>
                <Setup/>
            </Await>
        </Suspense>
    )
}

export default Root
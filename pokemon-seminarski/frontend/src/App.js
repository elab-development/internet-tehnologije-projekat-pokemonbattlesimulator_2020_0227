import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Welcome from './components/Welcome';
import Register from './components/Register';
import NoAuthLayout from './components/NoAuthLayout';
import AuthLayout from './components/AuthLayout';
import Login from './components/Login';
import Play from './components/Play';
import Home from './components/Home';
import AuthPageLayout from './components/AuthPageLayout';
import UserContextProvider from './contexts/UserContextProvider';
import GameScreen from './components/GameScreen';
import RequestPasswordReset from './components/RequestPasswordReset';
import MainLayout from './components/MainLayout';
import Settings from './components/Settings';
import CareerWrapper from './components/CareerWrapper';
import ResetPassword from './components/ResetPassword';
import RootV2 from './components/RootV2';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route id='root' element={<RootV2 />}>
      <Route id='req-auth' element={<AuthLayout />}>
        <Route element={<MainLayout />}>
          <Route path='/home' element={<Home />} />
          <Route path='/play' element={<Play />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/user/:id' element={<CareerWrapper />} />
        </Route>
        <Route path='/game/:id' element={<GameScreen />} />
      </Route>
      <Route id='no-auth' element={<NoAuthLayout />}>
        <Route path='/' element={<Welcome />} />
        <Route element={<AuthPageLayout />}>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/request-password-reset' element={<RequestPasswordReset />} />
          <Route path='/reset-password/:id' element={<ResetPassword />} />
        </Route>
      </Route>
    </Route >
  )
);

function App() {
  return (
    <UserContextProvider>
      <RouterProvider router={router} />
    </UserContextProvider>
  )
}

export default App;

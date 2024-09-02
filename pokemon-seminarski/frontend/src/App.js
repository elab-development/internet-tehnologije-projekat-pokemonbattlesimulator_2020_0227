import React from 'react';
import './App.css';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Root from './components/Root';
import Welcome from './components/Welcome';
import Register from './components/Register';
import NoAuthLayout from './components/NoAuthLayout';
import AuthLayout from './components/AuthLayout';
import Login from './components/Login';
import Play from './components/Play';
import Home from './components/Home';
import AuthPageLayout from './components/AuthPageLayout';
import UserContextProvider from './contexts/UserContextProvider';
import Collection from './components/Collection';
import GameScreen from './components/GameScreen';
import RequestPasswordReset from './components/RequestPasswordReset';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route id='root' element={<Root />}>
      <Route id='req-auth' element={<AuthLayout />}>
        <Route element={<MainLayout />}>
          <Route path='/home' element={<Home />} />
          <Route path='/pokedex' element={<Pokedex />} />
          <Route path='/play' element={<Play />} />
          <Route path='/user/:id' element={<Register />} />
          <Route path='/user/:id/collection' element={<Collection />} />
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

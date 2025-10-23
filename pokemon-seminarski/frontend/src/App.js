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
import EditProfile from './components/EditProfile';
import ResetPassword from './components/ResetPassword';
import RootV2 from './components/RootV2';
import Career from './components/Career';
import AdminLayout from './components/Admin/AdminLayout';
import WelcomeAdmin from './components/Admin/WelcomeAdmin';
import CreatePokemon from './components/Admin/CreatePokemon';
import CreateMove from './components/Admin/CreateMove';
import GivePokemon from './components/Admin/GivePokemon';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route id='root' element={<RootV2 />}>
      <Route id='req-auth' element={<AuthLayout />}>
        <Route element={<MainLayout />}>
          <Route path='/home' element={<Home />} />
          <Route path='/play' element={<Play />} />
          <Route path='/users/:id' element={<Career />} />
          <Route path='/users/:id/edit' element={<EditProfile />} />
          <Route id='admin-only' element={<AdminLayout />}>
            <Route path='/admin' element={<WelcomeAdmin />} />
            <Route path='/admin/create/pokemon' element={<CreatePokemon />} />
            <Route path='/admin/create/move' element={<CreateMove />} />
            <Route path='/admin/create/award' element={<GivePokemon />} />
          </Route>
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

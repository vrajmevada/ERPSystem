import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';
import GuestGuard from 'components/GuestGuard';

// jwt auth
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('pages/auth/Register')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  element: (
    <GuestGuard>
      <Outlet />
    </GuestGuard>
  ),
  children: [
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/register',
      element: <RegisterPage />
    }
  ]
};

export default LoginRoutes;

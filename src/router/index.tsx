import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layout
import MainLayout from '@/components/layout/MainLayout';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import BetPage from '../pages/BetPage';
import PremiumDashboardPage from '../pages/PremiumDashboardPage';
import AdminPage from '../pages/AdminPage';
import HistoriaPage from '../pages/HistoriaPage';
import AfiliadosPage from '../pages/AfiliadosPage';
import TransacoesPage from '../pages/TransacoesPage';
import ConfiguracoesPage from '../pages/ConfiguracoesPage';
import OrdersPage from '../pages/OrdersPage';

// PrivateRoute para rotas protegidas
import PrivateRoute from './PrivateRoute';

const router = createBrowserRouter(
  [
    // Rotas públicas
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/cadastro',
      element: <RegisterPage />,
    },
    {
      path: '/forgot-password',
      element: <ForgotPasswordPage />,
    },
    {
      path: '/reset-password',
      element: <ResetPasswordPage />,
    },
    {
      path: '/verify-email',
      element: <VerifyEmailPage />,
    },

    // Rotas protegidas
    {
      path: '/',
      element: <PrivateRoute />,
      children: [
        {
          path: '',            // rota raiz aninhada
          element: <MainLayout />,
          children: [
            // Página original de apostas
            { index: true, element: <BetPage /> },
            { path: 'dashboard', element: <BetPage /> },
            { path: 'bet', element: <BetPage /> },
            // Demais páginas
            { path: 'historia', element: <HistoriaPage /> },
            { path: 'afiliados', element: <AfiliadosPage /> },
            { path: 'transacoes', element: <TransacoesPage /> },
            { path: 'configuracoes', element: <ConfiguracoesPage /> },
            { path: 'ordens', element: <OrdersPage /> },
          ],
        },
      ],
    },

    // Rota de admin
    {
      path: '/admin',
      element: <PrivateRoute isAdminRoute={true} />,
      children: [
        {
          index: true,
          element: <AdminPage />,
        },
      ],
    },

    // Fallback para qualquer outra rota
    {
      path: '*',
      element: <PrivateRoute />,
      children: [
        { index: true, element: <BetPage /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

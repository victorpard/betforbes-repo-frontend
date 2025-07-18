
import React from 'react'
import { createBrowserRouter } from 'react-router-dom'

console.log('🗺️ Router: carregando rotas');

import MainLayout from "@/components/layout/MainLayout";

// páginas
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import VerifyEmailPage from '@/pages/VerifyEmailPage'
import PremiumDashboardPage from '@/pages/PremiumDashboardPage'
import AdminPage from '@/pages/AdminPage'
import HistoriaPage from '@/pages/HistoriaPage'
import BetPage from '@/pages/BetPage'
import AfiliadosPage from '@/pages/AfiliadosPage'
import TransacoesPage from '@/pages/TransacoesPage'
import ConfiguracoesPage from '@/pages/ConfiguracoesPage'
import OrdersPage from '@/pages/OrdersPage'

import PrivateRoute from './PrivateRoute'

const router = createBrowserRouter(
  [
    // públicas
    { path: '/login', element: <LoginPage /> },
    { path: '/cadastro', element: <RegisterPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
    { path: '/verify-email', element: <VerifyEmailPage /> },

    // protegidas
    {
      path: '/',
      element: <PrivateRoute />,
      children: [
        {
          path: '/',
          element: <MainLayout />,
          children: [
            { index: true, element: <PremiumDashboardPage /> },
            { path: 'dashboard', element: <PremiumDashboardPage /> },
            { path: 'bet', element: <BetPage /> },
            { path: 'historia', element: <HistoriaPage /> },
            { path: 'afiliados', element: <AfiliadosPage /> },
            { path: 'transacoes', element: <TransacoesPage /> },
            { path: 'configuracoes', element: <ConfiguracoesPage /> },
            { path: 'ordens', element: <OrdersPage /> }
          ]
        }
      ]
    },

    // admin
    {
      path: '/admin',
      element: <PrivateRoute requireAdmin={true} />,
      children: [{ index: true, element: <AdminPage /> }]
    },

    // fallback
    {
      path: '*',
      element: <PrivateRoute />,
      children: [{ path: '*', element: <PremiumDashboardPage /> }]
    }
  ],
  {
    future: { v7_startTransition: true }
  }
)

export default router

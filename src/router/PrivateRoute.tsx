import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PrivateRoute: React.FC = () => {
  const { user, isLoading } = useAuth();    // <-- aqui pegamos o isLoading
  const location = useLocation();

  // Enquanto a lib verifica se o usuário está autenticado, mostramos um loading
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se não tiver token, redireciona para /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Usuário autenticado: renderiza as rotas filhas
  return <Outlet />;
};

export default PrivateRoute;

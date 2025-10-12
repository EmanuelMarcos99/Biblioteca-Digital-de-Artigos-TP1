import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Enquanto o AuthContext está a verificar o token (ao carregar a página), não renderiza nada
  if (loading) {
    return <div>A verificar autenticação...</div>; 
  }

  // Se o utilizador não estiver autenticado, redireciona para a página de login
  // O 'state' guarda a página que ele tentou aceder, para o podermos redirecionar de volta após o login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se estiver autenticado, renderiza a página que foi pedida (os 'children')
  return children;
}

export default ProtectedRoute;


import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Cria o Contexto
const AuthContext = createContext(null);

// Cria o Provedor do Contexto, que irá envolver a sua aplicação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Efeito para verificar se já existe um token no localStorage ao carregar a app
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      // Diz ao nosso 'api' service para usar este token em todos os pedidos futuros
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Função de login que comunica com o backend
  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const { token, user: userData } = response.data;

      // Armazena o token e os dados do utilizador no localStorage para persistir a sessão
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Atualiza o header de autorização para todos os futuros pedidos da API
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      return true; // Retorna sucesso
    } catch (error) {
      console.error("Falha no login:", error);
      return false; // Retorna falha
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  // O valor que será partilhado com todos os componentes dentro deste Provedor
  const authContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação de forma mais simples
export const useAuth = () => {
  return useContext(AuthContext);
};


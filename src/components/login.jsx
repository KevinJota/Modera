/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase-config';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import '../css/Login.css';

// eslint-disable-next-line react/prop-types
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUserInfo = () => {
      const user = auth.currentUser;
      if (user) {
        console.log("ID do Moderador:", user.uid);
        console.log("Email do Moderador:", user.email);
      } else {
        console.log("Nenhum usuário autenticado.");
      }
    };

    getUserInfo();
  }, []);

  const validateForm = () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um email válido.');
      return false;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const moderadorId = userCredential.user.uid;

      // Verifica se o usuário é moderador
      const response = await fetch(`https://volun-api-eight.vercel.app/usuarios/${moderadorId}`);
      if (!response.ok) throw new Error('Erro ao verificar permissões.');

      const userData = await response.json();

      if (!userData.isModerator) {
        await signOut(auth); // Desfaz o login
        alert('Você não possui privilégios de moderação.');
        return;
      }

      // Usuário é moderador, continua o login
      onLogin(moderadorId);
    } catch (err) {
      setError('Falha no login: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login do Moderador</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="login-input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
        </div>
        <div className="login-input-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      {error && <div className="login-error">{error}</div>}
    </div>
  );
};

export default Login;

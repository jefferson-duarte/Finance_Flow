import { useState } from 'react';
import api from './api';

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false); // Alterna entre Login e Cadastro
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        // --- MODO CADASTRO ---
        await api.post('register/', { username, password, email });
        alert("Conta criada com sucesso! Faça login.");
        setIsRegistering(false); // Volta para a tela de login
      } else {
        // --- MODO LOGIN ---
        const response = await api.post('token/', { username, password });
        localStorage.setItem("access_token", response.data.access);
        onLogin();
      }
    } catch (error) {
      console.error(error);
      alert(isRegistering ? "Erro ao criar conta." : "Usuário ou senha incorretos!");
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h2>{isRegistering ? "Criar Conta" : "Login"}</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ padding: '8px' }}
        />

        {isRegistering && (
          <input
            type="email"
            placeholder="Email (opcional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: '8px' }}
          />
        )}

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: '8px' }}
        />

        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {isRegistering ? "Cadastrar" : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: '15px', fontSize: '14px' }}>
        {isRegistering ? "Já tem conta? " : "Não tem conta? "}
        <span
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegistering ? "Fazer Login" : "Cadastre-se"}
        </span>
      </p>
    </div>
  );
}

export default Login;
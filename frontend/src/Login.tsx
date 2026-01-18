import { useState } from 'react';
import api from './api';

// Recebe uma função 'onLogin' que será chamada quando der tudo certo
function Login({ onLogin }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			// Pede o token para o Django
			const response = await api.post('token/', { username, password });

			// Se deu certo, salva o token no navegador
			localStorage.setItem("access_token", response.data.access);

			// Avisa o App que o login foi feito
			onLogin();
		} catch (error) {
			alert("Usuário ou senha incorretos!");
		}
	};

	return (
		<div style={{ maxWidth: '300px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: '10px' }}>
					<label>Usuário:</label>
					<input
						type="text"
						value={username}
						onChange={e => setUsername(e.target.value)}
						style={{ width: '100%', padding: '8px' }}
					/>
				</div>
				<div style={{ marginBottom: '10px' }}>
					<label>Senha:</label>
					<input
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						style={{ width: '100%', padding: '8px' }}
					/>
				</div>
				<button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>
					Entrar
				</button>
			</form>
		</div>
	);
}

export default Login;
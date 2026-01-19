import { useState } from 'react';
import api from './api';

function Login({ onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegistering) {
                await api.post('register/', { username, password, email });
                alert("Conta criada com sucesso! Faça login.");
                setIsRegistering(false);
            } else {
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
        <div className="login-container">
            
            {/* LADO ESQUERDO: FORMULÁRIO */}
            <div className="login-left">
                <div className="login-content">
                    <div className="login-header">
                        <h1>💰 FinanceFlow</h1>
                        <p>{isRegistering ? "Crie sua conta gratuitamente" : "Bem-vindo de volta! 👋"}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="login-input-group">
                            <label>Usuário</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                required 
                                placeholder="Seu nome de usuário"
                            />
                        </div>

                        {isRegistering && (
                            <div className="login-input-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    placeholder="seu@email.com"
                                />
                            </div>
                        )}

                        <div className="login-input-group">
                            <label>Senha</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" className="btn-login">
                            {isRegistering ? "Criar Conta Grátis" : "Acessar Sistema"}
                        </button>
                    </form>

                    <p className="toggle-text">
                        {isRegistering ? "Já tem uma conta? " : "Não tem conta? "}
                        <span onClick={() => setIsRegistering(!isRegistering)}>
                            {isRegistering ? "Fazer Login" : "Cadastre-se agora"}
                        </span>
                    </p>
                </div>
            </div>

            {/* LADO DIREITO: VISUAL/BRANDING */}
            <div className="login-right">
                <div className="banner-text">
                    <h2>Controle suas finanças com simplicidade.</h2>
                    <p>O jeito mais fácil de gerenciar receitas, despesas e alcançar seus objetivos financeiros.</p>
                </div>
            </div>

        </div>
    );
}

export default Login;
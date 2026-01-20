import { useState } from 'react';
import api from './api';
import { useLanguage } from './LanguageContext';

function Login({ onLogin }) {
  const { t, changeLanguage, language } = useLanguage();

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await api.post('register/', { username, password, email });
        alert(t.alert_created);
        setIsRegistering(false);
      } else {
        const response = await api.post('token/', { username, password });
        localStorage.setItem("access_token", response.data.access);
        onLogin();
      }
    } catch (error) {
      console.error(error);
      alert(isRegistering ? t.alert_error_create : t.alert_error_login);
    }
  };

  return (
    <div className="login-container">

      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="login-left" style={{ position: 'relative' }}>

        {/* --- NOVO: BOTÕES DE IDIOMA (Canto Superior Direito) --- */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => changeLanguage('pt')}
            style={{
              background: language === 'pt' ? '#e0e7ff' : 'transparent',
              border: '1px solid #ddd',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: language === 'pt' ? 1 : 0.5, // Deixa transparente se não estiver selecionado
              transition: '0.2s'
            }}
            title="Português"
          >
            🇧🇷
          </button>
          <button
            onClick={() => changeLanguage('en')}
            style={{
              background: language === 'en' ? '#e0e7ff' : 'transparent',
              border: '1px solid #ddd',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: language === 'en' ? 1 : 0.5,
              transition: '0.2s'
            }}
            title="English"
          >
            🇺🇸
          </button>
        </div>

        <div className="login-content">
          <div className="login-header">
            <h1>💰 FinanceFlow</h1>
            <p>{isRegistering ? t.login_create_title : t.login_welcome}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label>{t.label_username}</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder={t.placeholder_user}
              />
            </div>

            {isRegistering && (
              <div className="login-input-group">
                <label>{t.label_email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.placeholder_email}
                />
              </div>
            )}

            <div className="login-input-group">
              <label>{t.label_password || "Senha"}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder={t.placeholder_pass}
              />
            </div>

            <button type="submit" className="btn-login">
              {isRegistering ? t.btn_create : t.btn_enter}
            </button>
          </form>

          <p className="toggle-text">
            {isRegistering ? t.text_has_account : t.text_no_account}
            <span onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? t.link_login : t.link_register}
            </span>
          </p>
        </div>
      </div>

      {/* LADO DIREITO: VISUAL/BRANDING */}
      <div className="login-right">
        <div className="banner-text">
          <h2>{t.banner_title}</h2>
          <p>{t.banner_text}</p>
        </div>
      </div>

    </div>
  );
}

export default Login;
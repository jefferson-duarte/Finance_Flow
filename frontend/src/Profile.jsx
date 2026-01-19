import { useState, useEffect } from 'react';
import api from './api';

function Profile() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '' // Senha começa vazia
  });
  const [loading, setLoading] = useState(true);

  // Carrega os dados atuais ao abrir
  useEffect(() => {
    api.get('profile/')
      .then(res => {
        setFormData({
          username: res.data.username,
          email: res.data.email,
          password: '' // Não trazemos a senha criptografada por segurança
        });
        setLoading(false);
      })
      .catch(err => alert("Erro ao carregar perfil."));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Prepara os dados para enviar
      const dataToSend = {
        username: formData.username,
        email: formData.email
      };

      // Só envia a senha se o usuário digitou algo
      if (formData.password) {
        dataToSend.password = formData.password;
      }

      await api.patch('profile/', dataToSend);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar. O nome de usuário pode já existir.");
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ maxWidth: '600px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, color: '#4f46e5' }}>Meu Perfil</h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>Atualize suas informações pessoais.</p>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nome de Usuário</label>
          <input
            type="text"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nova Senha</label>
          <input
            type="password"
            placeholder="Deixe em branco para manter a atual"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb' }}
          />
          <small style={{ color: '#6b7280' }}>Só preencha se quiser alterar sua senha.</small>
        </div>

        <button
          type="submit"
          style={{
            background: '#4f46e5', color: 'white', padding: '12px 20px',
            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}

export default Profile;
import { useState } from 'react';
import api from './api';
import { toast } from 'react-toastify';
import { useLanguage } from './LanguageContext';


function CategoryManager({ categories, onUpdate, onClose }) {
  const [newCategory, setNewCategory] = useState('');
  const { t } = useLanguage();

  // --- CRIAR ---
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory) return;

    try {
      await api.post('categories/', { name: newCategory });
      setNewCategory('');
      toast.success("Categoria adicionada!");
      onUpdate(); // Avisa o App para recarregar a lista
    } catch (error) {
      toast.error("Erro ao adicionar categoria.");
    }
  };

  // --- DELETAR ---
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza? As transações dessa categoria ficarão 'Sem Categoria'.")) {
      try {
        await api.delete(`categories/${id}/`);
        toast.info("Categoria removida.");
        onUpdate();
      } catch (error) {
        toast.error("Erro ao excluir.");
      }
    }
  };

  // --- EDITAR (RENOMEAR) ---
  const handleEdit = async (category) => {
    // Usaremos um prompt simples do navegador para facilitar
    const newName = window.prompt("Novo nome da categoria:", category.name);

    if (newName && newName !== category.name) {
      try {
        await api.patch(`categories/${category.id}/`, { name: newName });
        onUpdate();
      } catch (error) {
        alert("Erro ao renomear.");
      }
    }
  };

  return (
    <div style={{
      background: '#fff', border: '1px solid #ccc', padding: '20px',
      borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{t.category_title}</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer' }}>❌</button>
      </div>

      {/* Formulário de Adicionar */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder={t.placeholder_categoy}
          style={{ flex: 1, padding: '8px' }}
        />
        <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
          +
        </button>
      </form>

      {/* Lista de Categorias */}
      <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
        {categories.map(cat => (
          <li key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee' }}>
            <span>{cat.name}</span>
            <div style={{ display: 'flex', gap: '5px' }}>
              {/* Botão Editar */}
              <button
                onClick={() => handleEdit(cat)}
                style={{ background: '#ffc107', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                ✏️
              </button>
              {/* Botão Excluir */}
              <button
                onClick={() => handleDelete(cat.id)}
                style={{ background: '#dc3545', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryManager;
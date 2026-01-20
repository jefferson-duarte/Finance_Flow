function TransactionForm({ formData, setFormData, categories, onSubmit, editingTransaction, onCancelEdit }) {

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="card-box">
      <h3 style={{ marginTop: 0 }}>{editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Descrição</label>
          <input type="text" name="description" value={formData.description} onChange={handleInputChange} required placeholder="Ex: Conta de Luz" />
        </div>

        <div className="form-row">
          <div>
            <label>Valor</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required placeholder="0.00" />
          </div>
          <div>
            <label>Data</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Categoria</label>
            <select name="category" value={formData.category} onChange={handleInputChange}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Tipo</label>
            <select name="type" value={formData.type} onChange={handleInputChange}>
              <option value="IN">Entrada</option>
              <option value="OUT">Saída</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" className="btn-primary" style={{ background: editingTransaction ? '#f59e0b' : '' }}>
            {editingTransaction ? 'Salvar Alterações' : 'Adicionar Lançamento'}
          </button>
          {editingTransaction && (
            <button type="button" onClick={onCancelEdit} className="btn-primary" style={{ background: '#9ca3af' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;
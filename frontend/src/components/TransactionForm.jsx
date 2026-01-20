import { useLanguage } from '../LanguageContext';

function TransactionForm({ formData, setFormData, categories, onSubmit, editingTransaction, onCancelEdit }) {
  const { t } = useLanguage();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="card-box">
      <h3 style={{ marginTop: 0 }}>{editingTransaction ? t.form_edit_title : t.form_new_title}</h3>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>{t.label_desc}</label>
          <input type="text" name="description" value={formData.description} onChange={handleInputChange} required placeholder={t.placeholder_desc} />
        </div>

        <div className="form-row">
          <div>
            <label>{t.label_value}</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required placeholder="0.00" />
          </div>
          <div>
            <label>{t.label_date}</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>{t.label_category}</label>
            <select name="category" value={formData.category} onChange={handleInputChange}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>{t.label_type}</label>
            <select name="type" value={formData.type} onChange={handleInputChange}>
              <option value="IN">{t.type_in}</option>
              <option value="OUT">{t.type_out}</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" className="btn-primary" style={{ background: editingTransaction ? '#f59e0b' : '' }}>
            {editingTransaction ? t.btn_save : t.btn_add}
          </button>
          {editingTransaction && (
            <button type="button" onClick={onCancelEdit} className="btn-primary" style={{ background: '#9ca3af' }}>
              {t.btn_cancel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;
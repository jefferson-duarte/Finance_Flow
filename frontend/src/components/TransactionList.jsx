import { useLanguage } from '../LanguageContext';

function TransactionList({ transactions, onEdit, onDelete, onExportPDF }) {
  const { t } = useLanguage();

  return (
    <div className="transaction-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>{t.history_title}</h3>
        <button
          onClick={onExportPDF}
          style={{ background: '#4b5563', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}
        >
          {t.btn_pdf}
        </button>
      </div>

      <div className="list-content">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transaction-item">
            <div>
              <strong style={{ display: 'block', fontSize: '1.1rem' }}>{transaction.description}</strong>
              <small style={{ color: '#6b7280' }}>{transaction.date} • {transaction.category_name}</small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: 'bold', color: transaction.type === 'IN' ? '#10b981' : '#ef4444' }}>
                {transaction.type === 'IN' ? '+' : '-'} {t.currency_symbol} {transaction.amount}
              </span>
              <button onClick={() => onEdit(transaction)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✏️</button>
              <button onClick={() => onDelete(transaction.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>🗑️</button>
            </div>
          </div>
        ))}
        {transactions.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>{t.empty_list}</p>}
      </div>
    </div>
  );
}

export default TransactionList;
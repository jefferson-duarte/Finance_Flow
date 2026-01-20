function SummaryCards({ income, expense, balance }) {
  return (
    <div className="stats-grid">
      <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
        <h3>Receitas</h3>
        <p style={{ color: '#10b981' }}>R$ {income.toFixed(2)}</p>
      </div>
      <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
        <h3>Despesas</h3>
        <p style={{ color: '#ef4444' }}>R$ {expense.toFixed(2)}</p>
      </div>
      <div className="stat-card" style={{ borderLeft: '4px solid #4f46e5' }}>
        <h3>Saldo</h3>
        <p style={{ color: balance >= 0 ? '#4f46e5' : '#ef4444' }}>R$ {balance.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default SummaryCards;
import { useLanguage } from '../LanguageContext';

function SummaryCards({ income, expense, balance }) {
  const { t } = useLanguage();

  return (
    <div className="stats-grid">
      <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
        <h3>{t.card_income}</h3>
        <p style={{ color: '#10b981' }}>{t.currency_symbol} {income.toFixed(2)}</p>
      </div>
      <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
        <h3>{t.card_expense}</h3>
        <p style={{ color: '#ef4444' }}>{t.currency_symbol} {expense.toFixed(2)}</p>
      </div>
      <div className="stat-card" style={{ borderLeft: '4px solid #4f46e5' }}>
        <h3>{t.card_balance}</h3>
        <p style={{ color: balance >= 0 ? '#4f46e5' : '#ef4444' }}>{t.currency_symbol} {balance.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default SummaryCards;
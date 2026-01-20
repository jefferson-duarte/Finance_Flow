function DashboardHeader({ currentDate, onPrevMonth, onNextMonth, onGoToToday, onDateChange }) {

  // Função auxiliar para formatar data para o input date
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="content-header">
      <h2 style={{ margin: 0 }}>Visão Geral</h2>

      <div className="date-nav">
        <button
          onClick={onGoToToday}
          title="Voltar para Hoje"
          style={{ fontSize: '0.8rem', marginRight: '10px', background: '#e5e7eb', padding: '5px 10px', borderRadius: '5px' }}
        >
          Hoje
        </button>

        <button onClick={onPrevMonth}>{'<'}</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontWeight: 'bold', minWidth: '140px', textAlign: 'center' }}>
            {currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
          </span>
          <input
            type="date"
            value={formatDateForInput(currentDate)}
            onChange={onDateChange}
            style={{ width: '25px', height: '25px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
          />
        </div>

        <button onClick={onNextMonth}>{'>'}</button>
      </div>
    </div>
  );
}

export default DashboardHeader;
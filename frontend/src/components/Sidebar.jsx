import { useLanguage } from '../LanguageContext'; // <--- Importe o Hook

function Sidebar({ currentView, setCurrentView, onLogout, onOpenCategoryManager }) {
  const { t, changeLanguage, language } = useLanguage(); // <--- Use o Hook

  return (
    <aside className="sidebar">
      <div className="logo">
        <span>💰 FinanceFlow</span>
      </div>

      <nav className="menu">
        <button
          className={`menu-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          {t.menu_dashboard} {/* <--- Texto Dinâmico */}
        </button>

        <button
          className={`menu-item ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentView('profile')}
        >
          {t.menu_profile}
        </button>

        <button
          className="menu-item"
          onClick={onOpenCategoryManager}
        >
          {t.menu_categories}
        </button>
      </nav>

      {/* --- SELETOR DE IDIOMA --- */}
      <div style={{ marginTop: 'auto', marginBottom: '20px', display: 'flex', gap: '10px', padding: '0 10px' }}>
        <button
          onClick={() => changeLanguage('pt')}
          style={{
            flex: 1,
            background: language === 'pt' ? '#4f46e5' : '#374151',
            border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.2rem'
          }}
          title="Português"
        >
          🇧🇷
        </button>
        <button
          onClick={() => changeLanguage('en')}
          style={{
            flex: 1,
            background: language === 'en' ? '#4f46e5' : '#374151',
            border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.2rem'
          }}
          title="English"
        >
          🇺🇸
        </button>
      </div>

      <button onClick={onLogout} className="btn-logout">
        {t.menu_logout}
      </button>
    </aside>
  );
}

export default Sidebar;
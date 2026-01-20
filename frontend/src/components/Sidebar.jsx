function Sidebar({ currentView, setCurrentView, onLogout, onOpenCategoryManager }) {
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
          📊 Dashboard
        </button>
        
        <button 
          className={`menu-item ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentView('profile')}
        >
          👤 Meu Perfil
        </button>

        <button 
          className="menu-item" 
          onClick={onOpenCategoryManager}
        >
          ⚙️ Categorias
        </button>
      </nav>

      <button onClick={onLogout} className="btn-logout">
        Sair do Sistema
      </button>
    </aside>
  );
}

export default Sidebar;
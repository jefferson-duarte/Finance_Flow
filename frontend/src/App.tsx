import { useState, useEffect } from 'react'
import api from './api'
import './App.css'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Login from './Login' // Importa a tela de login
import CategoryManager from './CategoryManager';

function App() {
  // Estado para saber se está logado (verifica se tem token salvo)
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token")
  );

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda (01, 02...)
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([]) // Novo estado para categorias
  // null = modo de criação
  // objeto transação = modo de edição
  const [editingTransaction, setEditingTransaction] = useState(null)
  // Inicia com a data de hoje
  const [currentDate, setCurrentDate] = useState(new Date())

  // Estado para guardar os dados do formulário
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: getTodayDate(),
    category: '', // Aqui vai o ID da categoria
    type: 'OUT'   // Valor padrão: Saída
  })

  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions()
      fetchCategories()
    }
    // Adicione 'currentDate' aqui no array de dependências
  }, [isAuthenticated, currentDate])

  const fetchTransactions = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1 // Janeiro é 0, logo +1
      
      // Enviamos os parâmetros na URL
      const response = await api.get(`transactions/?month=${month}&year=${year}`)
      setTransactions(response.data)
    } catch (error) {
      console.error("Erro ao buscar transações:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('categories/')
      setCategories(response.data)
      // Se houver categorias, define a primeira como padrão no formulário para evitar erro
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, category: response.data[0].id }))
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    }
  }

  // Função genérica para atualizar os inputs do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category, // O ID da categoria
      type: transaction.type
    })
  }

  // Função que envia os dados para o Django
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTransaction) {
        // --- MODO EDIÇÃO (PUT) ---
        await api.put(`transactions/${editingTransaction.id}/`, formData)
        alert("Transação atualizada!")
        setEditingTransaction(null) // Sai do modo de edição
      } else {
        // --- MODO CRIAÇÃO (POST) ---
        await api.post('transactions/', formData)
        alert("Transação adicionada!")
      }

      fetchTransactions() // Atualiza a lista

      // Limpa o formulário
      setFormData({ description: '', amount: '', date: getTodayDate(), category: formData.category, type: 'OUT' })


    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar transação.")
    }
  }

  // Função para deletar
  const handleDelete = async (id) => {
    // Pergunta de confirmação simples
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        await api.delete(`transactions/${id}/`) // Remove do Banco

        // Remove da Tela (sem precisar ir no backend buscar tudo de novo)
        // Filtramos a lista atual mantendo apenas quem tem ID diferente do excluído
        setTransactions(transactions.filter(transaction => transaction.id !== id))
      } catch (error) {
        console.error("Erro ao deletar:", error)
        alert("Erro ao excluir.")
      }
    }
  }

  // Função para deslogar
  const handleLogout = () => {
    // 1. Apaga o token do navegador
    localStorage.removeItem("access_token");

    // 2. Limpa a autorização do Axios (opcional, mas boa prática)
    delete api.defaults.headers.common['Authorization'];

    // 3. Muda o estado para false (isso faz o React mostrar a tela de Login)
    setIsAuthenticated(false);

    // 4. Limpa os dados da tela para garantir
    setTransactions([]);
  }

  // Função para ir para o mês anterior
  const prevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  // Função para ir para o próximo mês
  const nextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  // 1. Botão para voltar para o mês atual
  const goToToday = () => {
    setCurrentDate(new Date());
  }

  // 2. Quando o usuário escolhe uma data específica no calendário
  const handleDateChange = (e) => {
    const dateValue = e.target.value; // Vem no formato "YYYY-MM-DD"
    if (dateValue) {
      // Precisamos corrigir o fuso horário para não cair no dia anterior
      const [year, month, day] = dateValue.split('-');
      const newDate = new Date(year, month - 1, day);
      setCurrentDate(newDate);
    }
  }

  // Função auxiliar para formatar a data atual para o input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- CÁLCULOS DO DASHBOARD ---

  // 1. Filtra só as entradas e soma os valores
  const income = transactions
    .filter(t => t.type === 'IN')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  // 2. Filtra só as saídas e soma
  const expense = transactions
    .filter(t => t.type === 'OUT')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  // 3. Calcula o saldo
  const balance = income - expense

  // --- PREPARAÇÃO PARA O GRÁFICO ---
  // Cores para as fatias do gráfico
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  // Agrupa despesas por categoria
  const expensesByCategory = transactions
    .filter(t => t.type === 'OUT') // Só queremos ver despesas no gráfico
    .reduce((acc, transaction) => {
      // Tenta achar se já temos essa categoria no acumulador
      const existingCategory = acc.find(item => item.name === transaction.category_name);

      if (existingCategory) {
        // Se já existe, soma o valor
        existingCategory.value += Number(transaction.amount);
      } else {
        // Se não existe, cria um novo item na lista
        acc.push({ name: transaction.category_name, value: Number(transaction.amount) });
      }
      return acc;
    }, []);

  // --- RENDERIZAÇÃO CONDICIONAL ---

  /// ... (Mantenha toda a lógica JS, imports, useEffects, etc.)

  if (!isAuthenticated) {
      return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="dashboard-layout">
      
      {/* --- BARRA LATERAL (ESQUERDA) --- */}
      <aside className="sidebar">
        <div className="logo">
          <span>💰 FinanceFlow</span>
        </div>

        <nav className="menu">
          <button className="menu-item active">
            📊 Dashboard
          </button>
          
          <button 
            className="menu-item" 
            onClick={() => setShowCategoryManager(true)}
          >
            ⚙️ Categorias
          </button>
        </nav>

        <button onClick={handleLogout} className="btn-logout">
          Sair do Sistema
        </button>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL (DIREITA) --- */}
      <main className="main-content">
        
        {/* Cabeçalho com Data */}
        <div className="content-header">
          <h2 style={{ margin: 0 }}>Visão Geral</h2>
          
          {/* Navegação de Data Turbinada */}
          <div className="date-nav">
            
            {/* Botão HOJE */}
            <button 
                onClick={goToToday} 
                title="Voltar para Hoje"
                style={{ fontSize: '0.8rem', marginRight: '10px', background: '#e5e7eb', padding: '5px 10px', borderRadius: '5px' }}
            >
                Hoje
            </button>

            <button onClick={prevMonth}>{'<'}</button>
            
            {/* Aqui está o truque: O Input de data substitui o texto estático */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '140px', textAlign: 'center' }}>
                    {currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                </span>
                
                {/* Ícone de calendário que abre o seletor */}
                <input 
                    type="date" 
                    value={formatDateForInput(currentDate)}
                    onChange={handleDateChange}
                    style={{ 
                        width: '25px', 
                        height: '25px', 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer',
                        padding: 0
                    }}
                    title="Escolher data específica"
                />
            </div>

            <button onClick={nextMonth}>{'>'}</button>
          </div>
        </div>

        {/* Gerenciador de Categorias (Modal/Overlay) */}
        {showCategoryManager && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
             <CategoryManager 
                categories={categories} 
                onUpdate={fetchCategories} 
                onClose={() => setShowCategoryManager(false)}
             />
          </div>
        )}

        {/* 1. CARDS DE RESUMO */}
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

        {/* 2. LINHA DO MEIO: FORMULÁRIO + GRÁFICO (LADO A LADO) */}
        <div className="row-container">
          
          {/* Formulário (Lado Esquerdo) */}
          <div className="card-box">
            <h3 style={{ marginTop: 0 }}>{editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
            <form onSubmit={handleSubmit}>
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
                    <button type="button" onClick={() => {setEditingTransaction(null); setFormData({description:'', amount:'', date:getTodayDate(), category: categories[0]?.id, type:'OUT'})}} className="btn-primary" style={{ background: '#9ca3af' }}>
                        Cancelar
                    </button>
                )}
              </div>
            </form>
          </div>

          {/* Gráfico (Lado Direito) */}
          <div className="card-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Gastos por Categoria</h3>
            {expensesByCategory.length > 0 ? (
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={expensesByCategory} dataKey="value" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ color: '#9ca3af' }}>Sem dados para exibir.</p>
            )}
          </div>

        </div>

        {/* 3. LISTA DE TRANSAÇÕES */}
        <div className="transaction-list">
          {/* Título fica FORA da área de scroll */}
          <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            Histórico Recente
          </h3>

          {/* Nova DIV que contem apenas os itens e tem o scroll */}
          <div className="list-content">
            
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div>
                  <strong style={{ display: 'block', fontSize: '1.1rem' }}>{transaction.description}</strong>
                  <small style={{ color: '#6b7280' }}>{transaction.date} • {transaction.category_name}</small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontWeight: 'bold', color: transaction.type === 'IN' ? '#10b981' : '#ef4444' }}>
                    {transaction.type === 'IN' ? '+' : '-'} R$ {transaction.amount}
                  </span>
                  <button onClick={() => handleEdit(transaction)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => handleDelete(transaction.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>🗑️</button>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                Nenhum lançamento neste mês.
              </p>
            )}
            
          </div>
        </div>

      </main>
    </div>
  )
}

export default App
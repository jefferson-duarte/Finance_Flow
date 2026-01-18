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
    date: '',
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
      setFormData({ description: '', amount: '', date: '', category: categories[0]?.id || '', type: 'OUT' })

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

  // ... (toda a lógica de javascript continua igual acima)

  if (!isAuthenticated) {
      return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      
      {/* CABEÇALHO */}
      <div className="header">
          <h1>💰 FinanceFlow</h1>
          <button onClick={handleLogout} className="btn-logout">Sair 🚪</button>
      </div>

      {/* NAVEGAÇÃO DE MÊS */}
      <div className="month-nav">
        <button onClick={prevMonth} className="btn-nav">{'<'}</button>
        <h2>{currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={nextMonth} className="btn-nav">{'>'}</button>
      </div>

      {/* BOTÃO GERENCIAR CATEGORIAS */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button 
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              style={{ background: 'transparent', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px', color: '#666' }}
          >
              {showCategoryManager ? 'Fechar Opções' : '⚙️ Gerenciar Categorias'}
          </button>
      </div>
      
      {showCategoryManager && (
          <CategoryManager 
              categories={categories} 
              onUpdate={fetchCategories} 
              onClose={() => setShowCategoryManager(false)}
          />
      )}

      {/* DASHBOARD CARDS */}
      <div className="dashboard-grid">
        <div className="summary-card income">
          <h3>Entradas</h3>
          <p>R$ {income.toFixed(2)}</p>
        </div>
        <div className="summary-card expense">
          <h3>Saídas</h3>
          <p>R$ {expense.toFixed(2)}</p>
        </div>
        <div className="summary-card balance">
          <h3>Saldo</h3>
          <p style={{ color: balance >= 0 ? '#3730a3' : '#991b1b' }}>R$ {balance.toFixed(2)}</p>
        </div>
      </div>

      {/* GRÁFICO */}
      {expensesByCategory.length > 0 && (
        <div style={{ height: '300px', marginBottom: '30px' }}>
             <ResponsiveContainer>
                 <PieChart>
                     <Pie data={expensesByCategory} dataKey="value" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({name}) => name}>
                        {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                     <Legend />
                 </PieChart>
             </ResponsiveContainer>
        </div>
      )}

      {/* FORMULÁRIO */}
      <div className="transaction-form">
        <h3>{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Descrição</label>
            <input type="text" name="description" value={formData.description} onChange={handleInputChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Valor</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Data</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Categoria</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="IN">Entrada</option>
                <option value="OUT">Saída</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-save" style={{ background: editingTransaction ? '#f59e0b' : '' }}>
                {editingTransaction ? 'Salvar Alterações' : 'Adicionar'}
            </button>
            {editingTransaction && (
                <button type="button" onClick={() => {setEditingTransaction(null); setFormData({description:'', amount:'', date:'', category: categories[0]?.id, type:'OUT'})}} className="btn-save" style={{ background: '#9ca3af' }}>
                    Cancelar
                </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTA */}
      <div className="transaction-list">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transaction-item">
            <div className="transaction-info">
              <strong>{transaction.description}</strong>
              <small>{transaction.date} • {transaction.category_name}</small>
            </div>
            
            <div className="transaction-actions">
              <span className={`amount ${transaction.type === 'IN' ? 'in' : 'out'}`}>
                {transaction.type === 'IN' ? '+' : '-'} R$ {transaction.amount}
              </span>
              <button onClick={() => handleEdit(transaction)} className="btn-icon">✏️</button>
              <button onClick={() => handleDelete(transaction.id)} className="btn-icon" style={{ color: '#ef4444' }}>🗑️</button>
            </div>
          </div>
        ))}
        {transactions.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>Nenhuma transação neste mês.</p>}
      </div>

    </div>
  )
}

export default App
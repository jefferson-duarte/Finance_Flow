import { useState, useEffect } from 'react'
import api from './api'
import './App.css'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Login from './Login' // Importa a tela de login

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

  // Se NÃO estiver logado, mostra a tela de Login
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // Se estiver logado, mostra o App normal
  return (
    <div className="app-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* --- CABEÇALHO COM BOTÃO DE SAIR --- */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px'
      }}>
        <h1 style={{ margin: 0 }}>💰 FinanceFlow</h1>

        <button
          onClick={handleLogout}
          style={{
            background: '#dc3545', // Vermelho
            color: '#fff',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          Sair 🚪
        </button>
      </div>

      {/* --- NAVEGAÇÃO DE MESES --- */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>
          {'<'}
        </button>
        
        <h2 style={{ margin: 0, textTransform: 'capitalize' }}>
          {/* Formata a data para português (ex: "Janeiro 2024") */}
          {currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
        </h2>

        <button onClick={nextMonth} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>
          {'>'}
        </button>
      </div>

      {/* --- DASHBOARD (RESUMO) --- */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>

        {/* Card Entradas */}
        <div style={{ flex: 1, background: '#d4edda', padding: '15px', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
          <h3 style={{ margin: 0, color: '#155724' }}>Entradas</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>
            R$ {income.toFixed(2)}
          </p>
        </div>

        {/* Card Saídas */}
        <div style={{ flex: 1, background: '#f8d7da', padding: '15px', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
          <h3 style={{ margin: 0, color: '#721c24' }}>Saídas</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>
            R$ {expense.toFixed(2)}
          </p>
        </div>

        {/* Card Saldo */}
        <div style={{ flex: 1, background: '#e2e3e5', padding: '15px', borderRadius: '8px', border: '1px solid #d6d8db' }}>
          <h3 style={{ margin: 0, color: '#383d41' }}>Saldo</h3>
          <p style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '5px 0',
            color: balance >= 0 ? 'green' : 'red' // Muda a cor se estiver negativo
          }}>
            R$ {balance.toFixed(2)}
          </p>
        </div>

      </div>

      {/* --- GRÁFICO DE DESPESAS --- */}
      {expensesByCategory.length > 0 && (
        <div style={{ marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', height: '300px' }}>
          <h3 style={{ textAlign: 'center', margin: 0 }}>Despesas por Categoria</h3>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%" // Posição X (centro)
                cy="50%" // Posição Y
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
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

      {/* --- FORMULÁRIO DE CADASTRO --- */}
      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Nova Transação</h2>
        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: '10px' }}>
            <label>Descrição: </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Valor: </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Data: </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Categoria: </label>
            <select name="category" value={formData.category} onChange={handleInputChange}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Tipo: </label>
            <select name="type" value={formData.type} onChange={handleInputChange}>
              <option value="IN">Entrada (Receita)</option>
              <option value="OUT">Saída (Despesa)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{
              padding: '8px 16px',
              background: editingTransaction ? '#ffc107' : '#28a745', // Amarelo se editar, Verde se criar
              color: editingTransaction ? '#000' : '#fff',
              border: 'none',
              cursor: 'pointer'
            }}>
              {editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}
            </button>

            {/* Botão de Cancelar Edição (só aparece se estiver editando) */}
            {editingTransaction && (
              <button
                type="button"
                onClick={() => {
                  setEditingTransaction(null)
                  setFormData({ description: '', amount: '', date: '', category: categories[0]?.id || '', type: 'OUT' })
                }}
                style={{ padding: '8px 16px', background: '#ccc', border: 'none', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- LISTAGEM --- */}
      <div className="transaction-list">
        <h3>Histórico</h3>

        {transactions.map((transaction) => (
          <div key={transaction.id} style={{
            borderBottom: '1px solid #ddd',
            padding: '10px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center' // Alinha o botão com o texto
          }}>
            <div>
              <strong>{transaction.description}</strong> ({transaction.category_name})
              <br />
              <small>{transaction.date}</small>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: transaction.type === 'IN' ? 'green' : 'red', fontWeight: 'bold' }}>
                {transaction.type === 'IN' ? '+' : '-'} R$ {transaction.amount}
              </span>

              {/* Botão Editar ✏️ */}
              <button
                onClick={() => handleEdit(transaction)}
                style={{
                  background: '#ffc107',
                  color: 'black',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Editar
              </button>

              {/* Botão Excluir */}
              <button
                onClick={() => handleDelete(transaction.id)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                X
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}

export default App
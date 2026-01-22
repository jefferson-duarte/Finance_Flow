import { useState, useEffect } from 'react';
import api from './api';
import Login from './Login';
import CategoryManager from './CategoryManager';
import Profile from './Profile';
import { useLanguage } from './LanguageContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Componentes Novos
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ExpensesChart from './components/ExpensesChart';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

function App() {
  const { language } = useLanguage();

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access_token"));
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Controle de Views e Modais
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: getTodayDate(),
    category: '',
    type: 'OUT'
  });

  // --- BUSCAR DADOS (Backend) ---
  const fetchTransactions = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get(`transactions/?month=${month}&year=${year}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('categories/');
      setCategories(response.data);
      if (response.data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: response.data[0].id }));
      }
    } catch (error) {
      console.error("Erro categorias:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchTransactions();
    }
  }, [isAuthenticated, currentDate]);

  // --- CÁLCULOS DO DASHBOARD ---
  const income = transactions.filter(t => t.type === 'IN').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const expense = transactions.filter(t => t.type === 'OUT').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const balance = income - expense;

  const expensesByCategory = Object.values(transactions
    .filter(t => t.type === 'OUT')
    .reduce((acc, curr) => {
      const catName = curr.category_name;
      if (!acc[catName]) acc[catName] = { name: catName, value: 0 };
      acc[catName].value += parseFloat(curr.amount);
      return acc;
    }, {}));

  // --- AÇÕES DO USUÁRIO ---
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    toast.info("Você saiu do sistema. Até logo! 👋");
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const [year, month, day] = dateValue.split('-');
      const newDate = new Date(year, month - 1, day);
      setCurrentDate(newDate);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await api.put(`transactions/${editingTransaction.id}/`, formData);
        setEditingTransaction(null);
        toast.success("Transação atualizada com sucesso! ✍️");
      } else {
        await api.post('transactions/', formData);
        toast.success("Lançamento adicionado! 🚀");
      }

      setFormData({
        description: '',
        amount: '',
        date: getTodayDate(),
        category: formData.category,
        type: 'OUT'
      });
      fetchTransactions();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar. Verifique os dados.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      try {
        await api.delete(`transactions/${id}/`);
        toast.info("Transação removida.");
        fetchTransactions();
      } catch (error) {
        toast.error("Erro ao excluir.");
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category,
      type: transaction.type
    });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setFormData({
      description: '',
      amount: '',
      date: getTodayDate(),
      category: categories[0]?.id,
      type: 'OUT'
    });
  };

  const handleExportPDF = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get(`export-pdf/?month=${month}&year=${year}&lang=${language}`, { 
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = language === 'pt' ? `Extrato_${month}-${year}.pdf` : `Statement_${month}-${year}.pdf`;
      link.setAttribute('download', fileName);      
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro PDF", error);
      alert("Erro ao gerar PDF.");
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="dashboard-layout">

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
        onOpenCategoryManager={() => setShowCategoryManager(true)}
      />

      <main className="main-content">

        {/* --- DASHBOARD VIEW --- */}
        {currentView === 'dashboard' && (
          <>
            <DashboardHeader
              currentDate={currentDate}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onGoToToday={() => setCurrentDate(new Date())}
              onDateChange={handleDateChange}
            />

            {showCategoryManager && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <CategoryManager
                  categories={categories}
                  onUpdate={fetchCategories}
                  onClose={() => setShowCategoryManager(false)}
                />
              </div>
            )}

            <SummaryCards income={income} expense={expense} balance={balance} />

            <div className="row-container">
              <TransactionForm
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                onSubmit={handleSubmit}
                editingTransaction={editingTransaction}
                onCancelEdit={handleCancelEdit}
              />

              <ExpensesChart data={expensesByCategory} colors={COLORS} />
            </div>

            <TransactionList
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onExportPDF={handleExportPDF}
            />
          </>
        )}

        {/* --- PROFILE VIEW --- */}
        {currentView === 'profile' && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
            <Profile />
          </div>
        )}

      </main>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;
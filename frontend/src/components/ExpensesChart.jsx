import { useLanguage } from '../LanguageContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ExpensesChart({ data, colors }) {
  const { t } = useLanguage();

  return (
    <div className="card-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{t.chart_title}</h3>
      {data.length > 0 ? (
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${t.currency_symbol} ${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p style={{ color: '#9ca3af' }}>{t.no_data}</p>
      )}
    </div>
  );
}

export default ExpensesChart;
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ExpensesChart({ data, colors }) {
  return (
    <div className="card-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Gastos por Categoria</h3>
      {data.length > 0 ? (
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
  );
}

export default ExpensesChart;
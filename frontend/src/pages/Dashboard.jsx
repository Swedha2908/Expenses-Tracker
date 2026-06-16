import { useEffect, useState } from 'react';
import api from '../api';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/transactions/dashboard');
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      }
    };
    fetchDashboard();
  }, []);

  if (!data) return <div className="p-8 text-center mt-20">Loading your financial insight...</div>;

  // Modern Glassmorphism Card Component
  const Card = ({ title, amount, color, isPercent = false }) => (
    <div className="bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300">
      <h3 className="text-gray-600 text-xs font-bold uppercase tracking-widest">{title}</h3>
      <p className={`text-3xl font-extrabold mt-3 ${color}`}>
        {isPercent ? `${amount}%` : `₹${amount.toLocaleString()}`}
      </p>
    </div>
  );

  const pieData = {
    labels: Object.keys(data.category_distribution),
    datasets: [{
      data: Object.values(data.category_distribution),
      backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
      borderWidth: 0,
    }]
  };

  const barData = {
    labels: ['Cash Flow'],
    datasets: [
      { label: 'Income', data: [data.total_income], backgroundColor: '#10B981' },
      { label: 'Expense', data: [data.total_expense], backgroundColor: '#EF4444' }
    ]
  };

  return (
    <div className="px-8 pb-8 pt-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Updated Summary Cards with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card title="Total Income" amount={data.total_income} color="text-green-600" />
        <Card title="Total Expenses" amount={data.total_expense} color="text-red-600" />
        <Card title="Current Balance" amount={data.balance} color="text-blue-600" />
        <Card title="Savings %" amount={data.savings_percentage} color="text-purple-600" isPercent={true} />
      </div>

      {/* Charts with Glassmorphism Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/40 backdrop-blur-md border border-white/50 p-8 rounded-3xl shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-gray-700">Expenses by Category</h3>
          <div className="h-64 flex justify-center"><Pie data={pieData} /></div>
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-white/50 p-8 rounded-3xl shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-gray-700">Cash Flow</h3>
          <div className="h-64"><Bar data={barData} options={{ maintainAspectRatio: false }} /></div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const initialFormState = {
    type: '',
    category: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch all transactions on mount
  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions/');
      // Sort by date descending (newest first)
      const sorted = res.data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
      setTransactions(sorted);
    } catch (error) {
      console.error("Error fetching transactions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure amount is a number and date is formatted properly for FastAPI
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      transaction_date: new Date(formData.transaction_date).toISOString()
    };

    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
        setEditingId(null);
      } else {
        await api.post('/transactions/', payload);
      }
      setFormData(initialFormState);
      fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction", error);
      alert("Failed to save transaction.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction", error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      transaction_date: transaction.transaction_date.split('T')[0]
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading transactions...</div>;

  const getCategoryStyle = (category) => {
    const styles = [
      "bg-blue-100 text-blue-700",
      "bg-purple-100 text-purple-700",
      "bg-pink-100 text-pink-700",
      "bg-orange-100 text-orange-700",
      "bg-teal-100 text-teal-700",
      "bg-indigo-100 text-indigo-700",
      "bg-rose-100 text-rose-700"
    ];
    // Create a simple hash to always assign the same color to the same category word
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return styles[Math.abs(hash) % styles.length];
  };

  return (<>
    <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* LEFT COLUMN: Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {editingId ? '✨ Edit Transaction' : '✨ Add Transaction'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
              <select
                name="type"
                required // Adding required ensures the user must pick a valid type
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="" disabled>Choose</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-purple-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                required
                placeholder="e.g., Groceries, Salary"
                value={formData.category}
                onChange={handleInputChange}
                className="block w-full p-3 border-2 border-purple-100 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 bg-purple-50/30 text-purple-900 placeholder-purple-300 font-medium transition-all"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-1">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-emerald-500 font-extrabold">₹</span>
                <input
                  type="number"
                  name="amount"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="block w-full pl-9 p-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 bg-emerald-50/30 text-emerald-900 font-bold transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-1">Date</label>
              <input
                type="date"
                name="transaction_date"
                required
                value={formData.transaction_date}
                onChange={handleInputChange}
                className="block w-full p-3 border-2 border-indigo-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 bg-indigo-50/30 text-indigo-900 font-medium transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Description (Optional)</label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleInputChange}
                className="block w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-50 bg-slate-50 text-slate-800 placeholder-slate-400 font-medium transition-all"
                placeholder="What was this for?"
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5"
              >
                {editingId ? 'Update Transaction' : 'Save Transaction'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData(initialFormState);
                  }}
                  className="bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Table */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {/* Made headers a bold slate/blue color */}
                <tr className="bg-slate-50 text-slate-700 text-sm uppercase font-bold tracking-wider">
                  <th className="p-4 border-b">Date</th>
                  <th className="p-4 border-b">Category</th>
                  <th className="p-4 border-b">Description</th>
                  <th className="p-4 border-b text-right">Amount</th>
                  <th className="p-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No transactions found. Start adding some!
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-blue-50/50 border-b last:border-0 transition-colors">

                      {/* DATE: Vibrant Indigo */}
                      <td className="p-4 text-sm font-bold text-black-900">
                        {new Date(tx.transaction_date).toLocaleDateString()}
                      </td>

                      {/* CATEGORY: Dynamic Colored Pill */}
                      <td className="p-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getCategoryStyle(tx.category)}`}>
                          {tx.category}
                        </span>
                      </td>

                      {/* DESCRIPTION: Darker Slate for contrast */}
                      <td className="p-4 text-sm font-medium text-slate-700 truncate max-w-xs">
                        {tx.description || '-'}
                      </td>

                      {/* AMOUNT: Kept Red/Green */}
                      <td className={`p-4 text-sm font-extrabold text-right ${tx.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </td>

                      {/* ACTIONS: Kept Blue/Red */}
                      <td className="p-4 text-center space-x-3">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </>
  );
}
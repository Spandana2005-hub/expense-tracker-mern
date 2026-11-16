import { useEffect, useState } from 'react';
import './App.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/expenses';
const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Other'];
const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
const emptyForm = () => ({ title: '', amount: '', category: 'Food', date: today() });

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // READ: get all expenses from the backend
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      if (!res.ok) throw new Error('Could not load expenses');
      setExpenses(await res.json());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CREATE or UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || Number(form.amount) <= 0) {
      setError('Please enter a title and an amount greater than 0');
      return;
    }
    try {
      const res = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setForm(emptyForm());
      setEditingId(null);
      loadExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (exp) => {
    setEditingId(exp._id);
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date.slice(0, 10),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    loadExpenses();
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="app">
      <header>
        <h1>💰 Expense Tracker</h1>
        <p>Know where your money goes</p>
      </header>

      <div className="total-card">
        <span>Total spent</span>
        <strong>₹{total.toLocaleString('en-IN')}</strong>
        <small>{expenses.length} expenses</small>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit expense' : 'Add expense'}</h2>
        <input name="title" placeholder="What did you spend on?" value={form.title} onChange={handleChange} />
        <input name="amount" type="number" placeholder="Amount (₹)" value={form.amount} onChange={handleChange} />
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input name="date" type="date" value={form.date} onChange={handleChange} />
        <div className="actions">
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <h2>All expenses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="empty">No expenses yet. Add your first one above!</p>
        ) : (
          <ul>
            {expenses.map((exp) => (
              <li key={exp._id}>
                <div>
                  <strong>{exp.title}</strong>
                  <span className="meta">
                    {exp.category} · {new Date(exp.date).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="right">
                  <span className="amount">₹{exp.amount.toLocaleString('en-IN')}</span>
                  <button className="link" onClick={() => handleEdit(exp)}>Edit</button>
                  <button className="link danger" onClick={() => handleDelete(exp._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
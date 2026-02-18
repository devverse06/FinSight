import ChatBox from "./pages/ChatBox"
import AddAccountNumbersPage from "./pages/AddAccountNumbersPage"
import React, { useState, useEffect } from 'react';
import {
  User, CreditCard, Upload, History, Plus,
  LogIn, UserPlus, ArrowLeft
} from 'lucide-react';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  // LOGIN
  const handleLogin = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        setUser({ username }); // backend cookie se user_id milega
        setCurrentPage('home');
      } else {
        alert(data.message || "Login failed");
      }
    } catch {
      alert("Login error. Please try again.");
    }
  };

  // SIGNUP
  const handleSignup = async (name, email, phonenumber, username, password, confirmPassword) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, phone_number: phonenumber, username, password })
      });
      const data = await response.json();
      if (data.success) {
        setUser({ username });
        setCurrentPage('home');
      } else {
        alert(data.message || "Signup failed");
      }
    } catch {
      alert("Signup error. Please try again.");
    }
  };

  // GET TRANSACTIONS
  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions/all', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) setTransactions(data.transactions);
      else alert(data.message || "Could not fetch transactions");
    } catch {
      alert("Fetch error. Please try again.");
    }
  };

  // ADD CASH TRANSACTION
  const handleAddCash = async (formData) => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions/add-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to_from: formData.to_from,
          amount: formData.amount,
          date: formData.date,
          credited_debited: formData.creditedDebited
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchTransactions();
        setCurrentPage('home');
      } else {
        alert(data.message || "Failed to add transaction");
      }
    } catch {
      alert("Add cash error. Please try again.");
    }
  };

  // --- UI COMPONENTS ---
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Payment Dashboard</h1>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-lg text-gray-600">Welcome, {user.username}!</span>
                <button
                  onClick={() => { setUser(null); setTransactions([]); }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage('login')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <LogIn size={16} /> Login
                </button>
                <button
                  onClick={() => setCurrentPage('signup')}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                >
                  <UserPlus size={16} /> Sign Up
                </button>
              </div>
            )}
          </div>

          {user ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div onClick={() => setCurrentPage('addCash')} className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded-xl text-white cursor-pointer hover:scale-105 transition-transform shadow-lg">
                <Plus size={32} className="mb-4" />
                <h3 className="text-xl font-semibold mb-2">Add Cash</h3>
                <p className="text-green-100">Add cash transactions</p>
              </div>
              <div onClick={() => setCurrentPage('upload')} className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded-xl text-white cursor-pointer hover:scale-105 transition-transform shadow-lg">
                <Upload size={32} className="mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload Transactions</h3>
                <p className="text-blue-100">Upload transaction files</p>
              </div>
              <div onClick={() => setCurrentPage('history')} className="bg-gradient-to-r from-purple-400 to-purple-600 p-6 rounded-xl text-white cursor-pointer hover:scale-105 transition-transform shadow-lg">
                <History size={32} className="mb-4" />
                <h3 className="text-xl font-semibold mb-2">Payment History</h3>
                <p className="text-purple-100">View all transactions</p>
              </div>
              <div onClick={() => setCurrentPage('accounts')} className="bg-gradient-to-r from-orange-400 to-orange-600 p-6 rounded-xl text-white cursor-pointer hover:scale-105 transition-transform shadow-lg">
                <Plus size={32} className="mb-4" />
                <h3 className="text-xl font-semibold mb-2">Add Account Number</h3>
                <p className="text-purple-100">View all account numbers</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <User size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">Welcome to Payment Manager</h2>
              <p className="text-gray-500 mb-6">Please login or signup to continue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });

    const handleSubmit = () => {
      handleLogin(formData.username, formData.password);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
            <ArrowLeft size={20} /> Back to Home
          </button>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Login</h2>
          <div className="space-y-6">
            <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            <button onClick={handleSubmit} className="w-full bg-blue-500 text-white py-3 rounded-lg">Login</button>
          </div>
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <button onClick={() => setCurrentPage('signup')} className="text-blue-500">Sign up</button>
          </p>
        </div>
      </div>
    );
  };

  const SignupPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phonenumber: '',
      username: '',
      password: '',
      confirmPassword: '',
    });

    const handleSubmitSignup = () => {
      const { name, email, phonenumber, username, password, confirmPassword } = formData;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10}$/;

      if (!emailRegex.test(email)) return alert("Please enter a valid email address");
      if (!phoneRegex.test(phonenumber)) return alert("Please enter a valid 10-digit phone number");
      if (password !== confirmPassword) return alert("Passwords don't match");

      handleSignup(name, email, phonenumber, username, password, confirmPassword);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
            <ArrowLeft size={20} /> Back to Home
          </button>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Sign Up</h2>
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={formData.phonenumber}
              onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleSubmitSignup}
              className="w-full bg-green-500 text-white py-3 rounded-lg"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AddCashPage = () => {
    const [formData, setFormData] = useState({
      date: new Date().toLocaleDateString('en-GB'),
      creditedDebited: 'credited',
      amount: '',
      to_from: ''
    });

    const handleSubmitCash = () => handleAddCash(formData);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Add Cash Transaction</h2>
            <div className="space-y-6">
              <input type="text" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg" placeholder="DD/MM/YY" />
              <select value={formData.creditedDebited} onChange={(e) => setFormData({...formData, creditedDebited: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg">
                <option value="credited">Credited</option>
                <option value="debited">Debited</option>
              </select>
              <input type="number" min="1" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg" placeholder="Amount" />
              <input type="string" value={formData.to_from} onChange={(e) => setFormData({...formData, to_from: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg" placeholder="To/From" />
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500">
                <p>• Account Number: XXXXXXXXXXXXXXXX</p>
                <p>• To/From: Cash</p>
                <p>• Reference: Will be auto-generated</p>
              </div>
              <button onClick={handleSubmitCash} className="w-full bg-green-500 text-white py-3 rounded-lg">Add Cash Transaction</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PaymentHistoryPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Payment History</h2>
          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {['Date', 'Account Number', 'To/From', 'Type', 'Amount', 'Reference'].map(h => (
                  <th key={h} className="border px-4 py-2 text-sm font-semibold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, idx) => (
                <tr key={txn._id || idx} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{txn.date}</td>
                  <td className="border px-4 py-2">{txn.account_number === 'XXXXXXXXXXXXXXXX' ? 'Cash Account' : txn.account_number}</td>
                  <td className="border px-4 py-2">{txn.to_from}</td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      txn.credited_debited === 'credited' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {txn.credited_debited}
                    </span>
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right">₹{txn.amount}</td>
                  <td className="border px-4 py-2 font-mono text-sm">{txn.reference_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // MAIN RENDER
  if (currentPage === 'login') return <LoginPage />;
  if (currentPage === 'signup') return <SignupPage />;
  if (currentPage === 'addCash') return <AddCashPage />;
  if (currentPage === 'history') return <PaymentHistoryPage />;
  if (currentPage === 'upload') return <ChatBox setCurrentPage = {setCurrentPage}/>;
  if (currentPage === 'accounts') return <AddAccountNumbersPage setCurrentPage={setCurrentPage} />;

  return <HomePage />;
};

export default App;
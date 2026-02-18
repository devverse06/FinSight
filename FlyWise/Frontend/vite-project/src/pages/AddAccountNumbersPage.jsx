import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const AddAccountNumbersPage = ({ setCurrentPage }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [addingAccount, setAddingAccount] = useState(false);

  // Fetch all accounts when component mounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/accounts/all', {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Filter out XXXXXXXXXXXXXXXX accounts
        const filteredAccounts = data.accounts.filter(account => 
          account.account_number !== 'XXXXXXXXXXXXXXXX'
        );
        setAccounts(filteredAccounts);
      } else {
        setError(data.message || 'Failed to load accounts');
      }
    } catch (err) {
      setError('Failed to load accounts. Please try again.');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };
  
const handleDeleteAccount = async (accountId, accountNumber) => {
  if (!window.confirm(`Are you sure you want to delete account ${accountNumber}?`)) {
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/accounts/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ account_number: accountNumber }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Remove the account from the local state
      setAccounts(accounts.filter(account => (account.id || account._id) !== accountId));
      setSuccess(`Account ${accountNumber} deleted successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(data.message || 'Failed to delete account');
      setTimeout(() => setError(''), 3000);
    }
  } catch (err) {
    setError('Failed to delete account. Please try again.');
    setTimeout(() => setError(''), 3000);
    console.error('Error deleting account:', err);
  }
};


const handleAddAccount = async () => {
  if (!newAccountNumber.trim()) {
    setError('Please enter an account number');
    setTimeout(() => setError(''), 3000);
    return;
  }

  setAddingAccount(true);
  setError('');

  try {
    const response = await fetch('http://localhost:5000/api/accounts/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ account_number: newAccountNumber.trim() }),
    });

    const data = await response.json();

    if (data.success) {
      // Refresh the accounts list
      await fetchAccounts();
      setNewAccountNumber('');
      setShowAddForm(false);
      setSuccess('Account added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      // Duplicate account error handle karo
      if (response.status === 409 || (data.message && data.message.toLowerCase().includes('already exists'))) {
        setError('This account already exists!');
      } else {
        setError(data.message || 'Failed to add account');
      }
      setTimeout(() => setError(''), 3000);
    }
  } catch (err) {
    setError('Failed to add account. Please try again.');
    setTimeout(() => setError(''), 3000);
    console.error('Error adding account:', err);
  } finally {
    setAddingAccount(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setCurrentPage('home')} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-gray-800">Manage Account Numbers</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Account
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Add Account Form */}
          {showAddForm && (
            <div className="mb-8 bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Account Number</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    disabled={addingAccount}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddAccount();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleAddAccount}
                  disabled={addingAccount}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {addingAccount ? 'Adding...' : 'Add Account'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewAccountNumber('');
                    setError('');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Accounts Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Your Account Numbers</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-gray-600">Loading accounts...</p>
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">No account numbers found</p>
                <p className="text-sm">Click "Add Account" to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-left border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-4 py-3 text-sm font-semibold text-gray-700">#</th>
                      <th className="border px-4 py-3 text-sm font-semibold text-gray-700">Account Number</th>
                      <th className="border px-4 py-3 text-sm font-semibold text-gray-700">Date Added</th>
                      <th className="border px-4 py-3 text-sm font-semibold text-gray-700 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account, index) => (
                      <tr key={account.id || account._id} className="hover:bg-gray-50">
                        <td className="border px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="border px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 font-mono">
                            {account.account_number}
                          </div>
                        </td>
                        <td className="border px-4 py-3 text-sm text-gray-500">
                          {account.created_at || account.createdAt 
                            ? new Date(account.created_at || account.createdAt).toLocaleDateString() 
                            : 'N/A'}
                        </td>
                        <td className="border px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteAccount(account.id || account._id, account.account_number)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {accounts.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Total accounts: {accounts.length}
            </div>
          )}

          <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-2">Note:</p>
            <p>• Cash transactions use account number: XXXXXXXXXXXXXXXX</p>
            <p>• These account numbers will be available for transaction uploads</p>
            <p>• Account numbers are unique to your user account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAccountNumbersPage;
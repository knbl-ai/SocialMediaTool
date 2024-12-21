import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const fetchedAccounts = await api.getAccounts();
      setAccounts(fetchedAccounts);
      setError(null);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData) => {
    try {
      const newAccount = await api.createAccount(accountData);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  };

  const updateAccount = async (accountId, accountData) => {
    try {
      const updatedAccount = await api.updateAccount(accountId, accountData);
      setAccounts(prev => 
        prev.map(account => 
          account._id === accountId ? updatedAccount : account
        )
      );
      return updatedAccount;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      await api.deleteAccount(accountId);
      setAccounts(prev => prev.filter(account => account._id !== accountId));
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount
  };
};

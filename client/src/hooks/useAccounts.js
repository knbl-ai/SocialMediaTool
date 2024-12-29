import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedAccounts = await api.getAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError(error.message);
      setAccounts([]);
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
    // Only fetch accounts if user is logged in
    if (user) {
      fetchAccounts();
    } else {
      setLoading(false);
      setAccounts([]);
    }
  }, [user]); // Re-fetch when user changes

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

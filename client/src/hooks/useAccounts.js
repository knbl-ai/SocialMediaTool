import { useState, useCallback } from 'react';
import api from '../lib/api';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accountsData = await api.getAccounts();
      setAccounts(accountsData.sort((a, b) => a.position - b.position));
    } catch (error) {
      setError(error.message);
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccount = async (accountId) => {
    try {
      await api.deleteAccount(accountId);
      setAccounts(prevAccounts => prevAccounts.filter(account => account._id !== accountId));
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const updateAccountPosition = async (accountId, newPosition) => {
    try {
      // Update local state immediately for smooth UI
      setAccounts(currentAccounts => {
        const updatedAccounts = [...currentAccounts];
        const accountIndex = updatedAccounts.findIndex(acc => acc._id === accountId);
        if (accountIndex !== -1) {
          const [movedAccount] = updatedAccounts.splice(accountIndex, 1);
          updatedAccounts.splice(newPosition, 0, movedAccount);
          return updatedAccounts.map((acc, index) => ({
            ...acc,
            position: index
          }));
        }
        return currentAccounts;
      });

      // Update server in background
      await api.updateAccount(accountId, { position: newPosition });
    } catch (error) {
      console.error('Error updating account position:', error);
      // Only fetch accounts if server update fails
      await fetchAccounts();
    }
  };

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    deleteAccount,
    updateAccountPosition
  };
};

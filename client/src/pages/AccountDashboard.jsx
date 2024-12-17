import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AccountName from '../components/AccountName';

const API_URL = import.meta.env.VITE_API_URL;

const AccountDashboard = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccountDetails();
  }, [accountId]);

  const fetchAccountDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/accounts/${accountId}`, {
        withCredentials: true
      });
      setAccount(response.data);
    } catch (error) {
      console.error('Error fetching account details:', error);
      setError(error.message);
    }
  };

  const handleNameUpdate = async (newName) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/accounts/${accountId}`,
        { name: newName },
        { withCredentials: true }
      );
      setAccount(response.data);
    } catch (error) {
      console.error('Error updating account name:', error);
      setError(error.message);
    }
  };

  const handleBack = () => {
    navigate('/accounts');
  };

  return (
    <div className="p-6 w-full h-full flex justify-between">
      <div className="mt-4">
       
        <AccountName 
          account={account} 
          onNameUpdate={handleNameUpdate}
        />
        {error && (
          <div className="text-red-500 mt-2">
            {error}
          </div>
        )}
      </div>
      <Button 
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Accounts
        </Button>
    </div>
  );
};

export default AccountDashboard;

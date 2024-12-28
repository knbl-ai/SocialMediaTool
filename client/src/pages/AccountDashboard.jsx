import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AccountName from '../components/AccountName';
import AccountOverview from '../components/AccountOverview';
import ConnectedPlatforms from '../components/ConnectedPlatforms';
import AccountTemplates from '../components/AccountTemplates';
import PostsDashboard from '../components/PostsDashboard';
import AccountSettings from '../components/AccountSettings';

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
    <div className="p-6 w-full h-full">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start flex-1">
          <div className="flex flex-col justify-evenly h-[216px] align-center"> 
            <AccountName 
              account={account} 
              onNameUpdate={handleNameUpdate}
            />
            <div className="flex justify-center ps-10">
              <ConnectedPlatforms/>
            </div>
          </div>
          <div className="flex flex-col gap-4 mx-12 mt-5">
            <AccountOverview 
              account={account}
              onUpdate={setAccount}
            />
          </div>
          <div className="flex-1">
            <AccountTemplates accountId={accountId} />
          </div>
        </div>
        <Button 
          onClick={handleBack}
          variant="outline"
          size="icon"
          className="rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="Back to Accounts"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>
    
      {/* Posts Dashboard */}
      <div className="mt-8">
        <PostsDashboard accountId={accountId} />
      </div>
      <div className="pb-10">
        <AccountSettings />
      </div>
      {error && (
        <div className="text-red-500 mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default AccountDashboard;

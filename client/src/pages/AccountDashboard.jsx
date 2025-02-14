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
import ContentPlanner from '../components/ContentPlanner';
import DownloadContentPlan from '../components/DownloadContentPlan';
const API_URL = import.meta.env.VITE_API_URL;

const AccountDashboard = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    navigate('/main');
  };

  const handleMonthChange = (date) => {
    setCurrentMonth(date);
  };

  return (
    <div className="p-6 w-full h-full">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start w-full gap-8">
          {/* Left sidebar - fixed width */}
          <div className="w-[400px] flex flex-col justify-evenly h-[256px] shrink-0"> 
            <AccountName 
              account={account} 
              onNameUpdate={handleNameUpdate}
            />
            <div className="flex justify-center">
              <ConnectedPlatforms accountId={accountId}/>
            </div>
          </div>

          {/* Middle section - flexible width */}
          <div className="flex-1 min-w-0 ">
            <AccountOverview 
              account={account}
              onUpdate={setAccount}
            />
          </div>

          {/* Right sidebar - fixed width */}
          <div className="w-[600px] shrink-0">
            <AccountTemplates accountId={accountId} />
          </div>
        </div>

        <Button 
          onClick={handleBack}
          variant="outline"
          size="icon"
          className="rounded-full hover:bg-gray-100 text-gray-500 ml-4"
          aria-label="Back to Accounts"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="pb-5 pt-1">
        <ContentPlanner />
      </div>
      {/* Posts Dashboard */}
      <div className="mt-8 ">
        <PostsDashboard 
          accountId={accountId} 
          onMonthChange={handleMonthChange}
        />
      </div>
      <div className="mt-4 ">
        <DownloadContentPlan currentMonth={currentMonth} accountId={accountId} />
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

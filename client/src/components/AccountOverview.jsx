import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import debounce from 'lodash/debounce';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL;

const AccountOverview = ({ account, onUpdate }) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [accountReview, setAccountReview] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (account) {
      setWebsiteUrl(account.websiteUrl || '');
      setAccountReview(account.accountReview || '');
    }
  }, [account]);

  const debouncedUpdate = useCallback(
    debounce(async (field, value) => {
      try {
        const response = await axios.patch(
          `${API_URL}/api/accounts/${account._id}`,
          { [field]: value },
          { withCredentials: true }
        );
        if (onUpdate) {
          onUpdate(response.data);
        }
      } catch (error) {
        console.error('Error updating account:', error);
      }
    }, 500),
    [account?._id, onUpdate]
  );

  const handleWebsiteChange = (e) => {
    const value = e.target.value;
    setWebsiteUrl(value);
    debouncedUpdate('websiteUrl', value);
  };

  const handleReviewChange = (e) => {
    const value = e.target.value;
    setAccountReview(value);
    debouncedUpdate('accountReview', value);
  };

  const handleAnalyze = async () => {
    if (!websiteUrl) return;
    
    setIsAnalyzing(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/accounts/${account._id}/analyze`,
        { url: websiteUrl },
        { withCredentials: true }
      );
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Error analyzing website:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl bg-background">
      <div className="flex gap-3 items-center">
        <input
          type="url"
          value={websiteUrl}
          onChange={handleWebsiteChange}
          placeholder="Enter website URL"
          className="flex-1 px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 dark:text-gray-100 focus:outline-none border dark:border-gray-700"
        />
        
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !websiteUrl}
          variant="outline"
          className="shrink-0 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-100"
        >
          {isAnalyzing ? 'ANALYZING...' : 'ANALYZE WEBSITE'}
        </Button>
      </div>
      <textarea
        value={accountReview}
        onChange={handleReviewChange}
        placeholder="Account review will appear here"
        className="w-full h-40 px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 dark:text-gray-100 focus:outline-none resize-none h-44 border dark:border-gray-700"
      />
    </div>
  );
};

export default AccountOverview;

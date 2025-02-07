import { useState, useEffect, useRef } from 'react';
import { FileTextIcon, FileIcon, GlobeIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import WebButton from './contentPlanner/WebButton';
import PDFButton from './contentPlanner/PDFButton';
import GoogleDocButton from './contentPlanner/GoogleDocButton';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AccountOverview = ({ account, onUpdate }) => {
  const [accountReview, setAccountReview] = useState('');
  const accountReviewRef = useRef(accountReview);
  const timeoutRef = useRef(null);

  useEffect(() => {
    accountReviewRef.current = accountReview;
  }, [accountReview]);

  useEffect(() => {
    if (account) {
      setAccountReview(account.accountReview || '');
    }
  }, [account]);

  // Debounced update effect for account review
  useEffect(() => {
    if (!account?._id) return;

    const hasReviewChanges = () => {
      return accountReviewRef.current !== account.accountReview;
    };

    if (!hasReviewChanges()) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await axios.patch(
          `${API_URL}/api/accounts/${account._id}`,
          { accountReview: accountReviewRef.current },
          { withCredentials: true }
        );
        if (onUpdate) {
          onUpdate(response.data);
        }
      } catch (error) {
        console.error('Error updating account review:', error);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [accountReview, account, onUpdate]);

  const handleReviewChange = (e) => {
    setAccountReview(e.target.value);
  };

  const handleDocSuccess = (review) => {
    if (review) {
      setAccountReview(review);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-background pt-4">
      <div className="flex justify-end gap-2">
        <WebButton 
          accountId={account?._id}
          onSuccess={handleDocSuccess}
          isContentPlanner={false}
        />
        <PDFButton 
          accountId={account?._id}
          onSuccess={handleDocSuccess}
          isContentPlanner={false}
        />
        <GoogleDocButton 
          accountId={account?._id}
          onSuccess={handleDocSuccess}
          isContentPlanner={false}
        />
      </div>
      <textarea
        value={accountReview}
        onChange={handleReviewChange}
        placeholder="Write account overview here..."
        className="w-full h-48 px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 dark:text-gray-100 focus:outline-none resize-none h-44 border dark:border-gray-700"
      />
    </div>
  );
};

export default AccountOverview;

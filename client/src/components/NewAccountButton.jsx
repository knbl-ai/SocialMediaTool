import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const NewAccountButton = ({ onAccountCreated }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/accounts`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (onAccountCreated) {
        onAccountCreated(response.data);
      }
      navigate(`/account/${response.data._id}`);
    } catch (error) {
      console.error('Error creating account:', error);
      setError(error.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleCreateAccount}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        {loading ? 'Creating...' : 'New Account'}
      </Button>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default NewAccountButton;

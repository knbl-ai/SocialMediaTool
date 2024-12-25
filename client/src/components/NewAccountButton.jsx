import { useState } from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle } from "lucide-react";
import api from '../lib/api';

const NewAccountButton = ({ onAccountCreated }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.createAccount({});

      if (onAccountCreated) {
        onAccountCreated(response);
      }
      navigate(`/account/${response._id}`);
    } catch (error) {
      console.error('Error creating account:', error);
      setError(error.message || 'Failed to create account');
      if (error.status === 401) {
        navigate('/auth');
      }
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

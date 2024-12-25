import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AccountCard = ({ account, onAccountDeleted }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteState, setDeleteState] = useState('initial'); // 'initial' | 'confirm'
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent card click navigation

    if (!user) {
      navigate('/auth');
      return;
    }

    if (deleteState === 'initial') {
      setDeleteState('confirm');
      // Reset to initial state after 3 seconds if not clicked
      setTimeout(() => setDeleteState('initial'), 3000);
      return;
    }

    if (deleteState === 'confirm') {
      setIsDeleting(true);
      setError(null);
      try {
        await onAccountDeleted(account._id);
      } catch (error) {
        console.error('Error deleting account:', error);
        setError(error.message);
        if (error.status === 401) {
          navigate('/auth');
        }
      }
      setIsDeleting(false);
      setDeleteState('initial');
    }
  };

  return (
    <Card 
      className="w-[40vw] mb-8 cursor-pointer hover:bg-accent transition-colors relative group"
      onClick={() => navigate(`/account/${account._id}`)}
    >
      <div 
        className="absolute top-4 right-4 z-10"
        onClick={handleDelete}
      >
        {deleteState === 'initial' ? (
          <Trash2 
            className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
          />
        ) : (
          <span className="text-sm font-medium text-destructive">
            {isDeleting ? 'Deleting...' : 'Really?'}
          </span>
        )}
      </div>

      <CardHeader className="p-6">
        <CardTitle>{account.name || 'Untitled Account'}</CardTitle>
        <CardDescription>{account.description || 'No description'}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <div className="text-sm text-red-500 mt-2">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountCard;

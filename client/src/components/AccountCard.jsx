import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useNavigate } from 'react-router-dom';
import { Trash2, Building2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDrag, useDrop } from 'react-dnd';

const AccountCard = ({ account, onAccountDeleted, index, onDrop }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteState, setDeleteState] = useState('initial');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'ACCOUNT_CARD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'ACCOUNT_CARD',
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Time to actually perform the action
      onDrop(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // Initialize drag and drop refs
  drag(drop(ref));

  const handleDelete = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate('/auth');
      return;
    }

    if (deleteState === 'initial') {
      setDeleteState('confirm');
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
      ref={ref}
      className={`w-[40vw] mb-8 cursor-grab hover:bg-accent transition-colors relative group h-[20vh] ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
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

      <div className="flex h-full">
        <div className="w-[120px] h-full flex items-center justify-center p-4 border-l">
          {account.logoUrl ? (
            <div 
              className="w-20 h-20 rounded-full bg-center bg-cover border-2 border-gray-100"
              style={{ backgroundImage: `url(${account.logoUrl})` }}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-2">
              {account.name || 'Untitled Account'}
            </CardTitle>
            <div className="h-[calc(20vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <CardDescription className="text-sm">
                {account.accountReview || 'No description'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default AccountCard;

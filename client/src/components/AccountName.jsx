import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Camera } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const API_URL = import.meta.env.VITE_API_URL;

const AccountName = ({ account, onNameUpdate }) => {
  const [name, setName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef(null);
  const lastSavedName = useRef('');

  useEffect(() => {
    if (account?.name) {
      setName(account.name);
      lastSavedName.current = account.name;
    } else {
      setName('');
      lastSavedName.current = '';
    }
  }, [account]);

  const handleUpdate = useCallback(async (newName) => {
    if (!account?._id || newName === lastSavedName.current) return;
    
    try {
      setIsUpdating(true);
      await onNameUpdate(newName);
      lastSavedName.current = newName;
    } catch (error) {
      console.error('Error updating name:', error);
      // Revert to last saved name on error
      setName(lastSavedName.current);
    } finally {
      setIsUpdating(false);
    }
  }, [account?._id, onNameUpdate]);

  const debouncedUpdate = useDebounce(handleUpdate, 500);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    debouncedUpdate(newName);
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !account?._id) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await axios.post(
        `${API_URL}/api/accounts/${account._id}/logo`,
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      if (onNameUpdate && response.data) {
        onNameUpdate(response.data.name, response.data);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  return (
    <div className="flex items-center gap-4 justify-center w-full">
      <div 
        className="relative w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden group"
        onClick={handleLogoClick}
      >
        {account?.logoUrl ? (
          <>
            <img 
              src={account.logoUrl} 
              alt={account.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </>
        ) : (
          <Camera className="w-6 h-6 text-gray-400" />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <div className='flex items-center justify-center'>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          disabled={isUpdating}
          placeholder="Account Name"
          className={`text-3xl font-bold bg-transparent border-none focus:border-none focus:outline-none focus:ring-0 p-0 h-auto text-center w-60
                   relative
                   after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1
                   after:bg-gradient-to-r after:from-red-500 after:via-yellow-500 after:via-green-500 after:via-blue-500 after:to-purple-500
                   ${isUpdating ? 'opacity-50' : ''}`}
        />
      </div>
    </div>
  );
};

export default AccountName;

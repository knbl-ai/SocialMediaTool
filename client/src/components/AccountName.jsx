import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Camera } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AccountName = ({ account, onNameUpdate }) => {
  const [name, setName] = useState('');
  const fileInputRef = useRef(null);
  const timeoutRef = useRef(null);
  const initializedRef = useRef(false);
  const isSavingRef = useRef(false);

  // Initialize name from account
  useEffect(() => {
    if (account?.name && !initializedRef.current) {
      setName(account.name);
      initializedRef.current = true;
    }
  }, [account]);

  // Simple debounced save function
  const debouncedSave = (newName) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(async () => {
      if (!account?._id || isSavingRef.current) return;
      
      try {
        // Use ref instead of state to avoid re-renders
        isSavingRef.current = true;
        await onNameUpdate(newName);
      } catch (error) {
        console.error('Error updating name:', error);
      } finally {
        isSavingRef.current = false;
      }
    }, 500);
  };

  // Handle name change
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName); // Update UI immediately
    debouncedSave(newName); // Schedule API update
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

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
          placeholder="Account Name"
          data-auto-dir="true"
          className="text-3xl font-bold bg-transparent border-none focus:border-none focus:outline-none focus:ring-0 p-0 h-auto text-center w-60
                   relative
                   after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1
                   after:bg-gradient-to-r after:from-red-500 after:via-yellow-500 after:via-green-500 after:via-blue-500 after:to-purple-500"
        />
      </div>
    </div>
  );
};

export default AccountName;

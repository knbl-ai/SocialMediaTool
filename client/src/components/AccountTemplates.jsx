import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';
import { HexColorPicker } from 'react-colorful';

const API_URL = import.meta.env.VITE_API_URL;

const AccountTemplates = ({ accountId }) => {
  const [colors, setColors] = useState({
    main: '#4F46E5',
    secondary: '#6366F1',
    title: '#1F2937',
    text: '#4B5563'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputColor, setInputColor] = useState('');

  useEffect(() => {
    fetchColors();
  }, [accountId]);

  const fetchColors = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/accounts/${accountId}`, {
        withCredentials: true
      });
      
      if (response.data.colors) {
        setColors(response.data.colors);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching colors:', error);
      setError('Failed to load colors');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = async (colorKey, newColor) => {
    try {
      const newColors = { ...colors, [colorKey]: newColor };
      setColors(newColors);

      await axios.patch(
        `${API_URL}/api/accounts/${accountId}`,
        { colors: newColors },
        { withCredentials: true }
      );
      setError(null);
    } catch (error) {
      console.error('Error updating colors:', error);
      setError('Failed to update colors');
      fetchColors();
    }
  };

  const handleInputChange = (e, key) => {
    const value = e.target.value;
    setInputColor(value);
    
    // Update color if it's a valid hex code
    if (value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      handleColorChange(key, value);
    }
  };

  if (loading) return <div className="animate-pulse">Loading colors...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const colorEntries = Object.entries(colors).filter(([key]) => key !== '_id');

  return (
    <div className="flex gap-6 items-center">
      {colorEntries.map(([key, value]) => (
        <Dialog.Root 
          key={key} 
          open={isOpen && selectedColor === key}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
              setSelectedColor(key);
              setInputColor(value.toUpperCase());
            }
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <label className="text-xs text-gray-500 capitalize">{key}</label>
            <Dialog.Trigger asChild>
              <div 
                className="w-10 h-10 rounded-full border border-gray-200 transition-transform hover:scale-110 cursor-pointer"
                style={{ backgroundColor: value }}
              />
            </Dialog.Trigger>
          </div>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
              <Dialog.Title className="text-lg font-medium mb-4">
                Choose {key} Color
              </Dialog.Title>
              <div className="flex flex-col gap-4">
                <HexColorPicker
                  color={value}
                  onChange={(newColor) => {
                    handleColorChange(key, newColor);
                    setInputColor(newColor.toUpperCase());
                  }}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputColor}
                    onChange={(e) => handleInputChange(e, key)}
                    placeholder="#000000"
                    className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-300 w-28 font-mono uppercase bg-gray-50"
                    maxLength={7}
                  />
                  <div
                    className="w-8 h-8 rounded-md"
                    style={{ backgroundColor: value }}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Dialog.Close className="px-4 py-2 text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                  Done
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ))}
    </div>
  );
};

export default AccountTemplates;

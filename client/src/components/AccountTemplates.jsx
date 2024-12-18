import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { HexColorPicker } from 'react-colorful';
import axios from 'axios';

const AccountTemplates = ({ accountId }) => {
  const [colors, setColors] = useState([
    { name: 'Main', color: '#4F46E5', key: 'mainColor' },
    { name: 'Secondary', color: '#10B981', key: 'secondaryColor' },
    { name: 'Title', color: '#1F2937', key: 'titleColor' },
    { name: 'Text', color: '#6B7280', key: 'textColor' }
  ]);

  const [selectedColor, setSelectedColor] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputColor, setInputColor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColors();
  }, [accountId]);

  const fetchColors = async () => {
    try {
      const response = await axios.get(`/api/accounts/${accountId}/template`);
      const template = response.data;
      
      setColors(colors.map(item => ({
        ...item,
        color: template[item.key]
      })));
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (newColor) => {
    if (selectedColor) {
      setColors(colors.map(item => 
        item.name === selectedColor.name 
          ? { ...item, color: newColor }
          : item
      ));
      setInputColor(newColor.toUpperCase());
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputColor(value);
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      handleColorChange(value);
    }
  };

  const handleOpen = (item) => {
    setSelectedColor(item);
    setInputColor(item.color.toUpperCase());
  };

  const handleClose = async () => {
    setIsOpen(false);
    if (selectedColor) {
      try {
        const colorData = colors.reduce((acc, item) => {
          acc[item.key] = item.color;
          return acc;
        }, {});

        await axios.put(`/api/accounts/${accountId}/template`, colorData);
      } catch (error) {
        console.error('Error saving colors:', error);
        // Optionally show an error message to the user
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex gap-6 items-center">
      {colors.map((item) => (
        <div key={item.name} className="flex flex-col items-center gap-2">
          <Dialog.Root open={isOpen && selectedColor?.name === item.name} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) handleOpen(item);
            if (!open) handleClose();
          }}>
            <Dialog.Trigger asChild>
              <div
                className="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: item.color }}
              />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
                <Dialog.Title className="text-lg font-medium mb-4">
                  Choose {item.name} Color
                </Dialog.Title>
                <div className="flex flex-col gap-4">
                  <HexColorPicker
                    color={item.color}
                    onChange={handleColorChange}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputColor}
                      onChange={handleInputChange}
                      placeholder="#000000"
                      className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-300 w-28 font-mono uppercase bg-gray-50"
                      maxLength={7}
                    />
                    <div
                      className="w-8 h-8 rounded-md"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Done
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <span className="text-xs text-gray-500 font-medium">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AccountTemplates;

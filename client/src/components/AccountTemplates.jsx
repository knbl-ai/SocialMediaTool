import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';
import { HexColorPicker } from 'react-colorful';
import { RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AccountTemplates = ({ accountId, logoUrl }) => {
  const [colors, setColors] = useState({
    main: '#4F46E5',
    secondary: '#6366F1',
    title: '#1F2937',
    text: '#4B5563'
  });
  const [selectedColor, setSelectedColor] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputColor, setInputColor] = useState('');
  const [templateImages, setTemplateImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchColors();
  }, [accountId]);

  const fetchColors = async () => {
    if (!accountId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/api/accounts/${accountId}`, {
        withCredentials: true
      });
      
      // First set the colors
      if (response.data.colors) {
        setColors(response.data.colors);
      }
  
      // Wait for a bit to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
  
      // Then check and handle templates
      if (!response.data.templatesURLs || response.data.templatesURLs.length === 0) {
        console.log('No templates found, generating...');
        await generateTemplates();
      } else {
        setTemplateImages(response.data.templatesURLs);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching account data:', error);
      setError('Failed to load account data');
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

  const generateTemplates = async () => {
    if (!accountId) return;
    
    setIsGenerating(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/accounts/${accountId}/generate-templates`,
        {},  // Server will use account data
        { withCredentials: true }
      );
  
      if (response.data.success) {
        // Wait a bit before setting templates
        await new Promise(resolve => setTimeout(resolve, 500));
        setTemplateImages(response.data.templatesURLs);
        setError(null);
      }
    } catch (error) {
      console.error('Error generating templates:', error);
      setError('Failed to generate templates');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e, key) => {
    const value = e.target.value;
    setInputColor(value);
    
    if (value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      handleColorChange(key, value);
    }
  };

  if (loading) return <div className="animate-pulse">Loading colors...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const colorEntries = Object.entries(colors).filter(([key]) => key !== '_id');

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-center gap-6 mb-4">
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
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 capitalize mb-2">{key}</label>
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
        <div className="flex flex-col items-center">
          <div className="h-[18px] mb-2"></div>
          <button
            onClick={generateTemplates}
            disabled={isGenerating}
            className="rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 flex items-center justify-center h-15 w-15"
            aria-label="Generate templates"
          >
            <RefreshCw size={20} className={`text-gray-600 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center overflow-x-auto py-2">
        <div className="flex gap-4">
          {templateImages.map((imageUrl, index) => (
            <div 
              key={index}
              className="relative group flex-shrink-0"
            >
              <img
                src={imageUrl}
                alt={`Template ${index + 1}`}
                className="h-[150px] w-auto object-cover rounded-lg border border-gray-200 transition-transform hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountTemplates;

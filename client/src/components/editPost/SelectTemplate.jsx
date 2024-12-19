import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SelectTemplate = ({ accountId }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accountId) {
      console.warn('SelectTemplate: No accountId provided');
      setLoading(false);
      setError('No account selected');
      return;
    }

    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = `${API_URL}/api/accounts/${accountId}`;
        console.log('Fetching templates from:', url);
        
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) throw new Error('Failed to fetch templates');

        const data = await response.json();
        const templatesData = data.templatesURLs || [];
        console.log('Parsed templates:', templatesData);
        
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError(error.message || 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [accountId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[400px] h-[450px] flex items-center justify-center text-center text-gray-500">
        <div>
          <p className="font-medium">Error loading templates</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div className="w-[400px] h-[450px] flex items-center justify-center text-center text-gray-500">
        No templates available
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-medium mb-2">Templates</h3>
      <div className="flex-1 overflow-y-auto space-y-3">
        {templates.map((templateUrl, index) => (
          <div 
            key={index} 
            className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
          >
            <img 
              src={templateUrl} 
              alt={`Template ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                variant="secondary" 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectTemplate;

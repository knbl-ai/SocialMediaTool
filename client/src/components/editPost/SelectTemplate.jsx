import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function SelectTemplate({ accountId }) {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (!accountId) {
      console.warn('SelectTemplate: No accountId provided');
      setIsLoading(false);
      setError('No account selected');
      return;
    }

    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [accountId]);

  if (isLoading) {
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
      <div className="space-y-4 flex-1 overflow-y-auto px-3 py-3">
        <div
          onClick={() => setSelectedTemplate(null)}
          className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
            selectedTemplate === null 
              ? 'ring-2 ring-offset-2 ring-[#6499E9] shadow-[0_0_15px_rgba(255,28,247,0.5)]' 
              : 'hover:scale-[1.02]'
          }`}
        >
          <div className="aspect-square relative bg-gray-50 flex items-center justify-center">
            <span className="text-gray-500 font-medium">No Template</span>
          </div>
        </div>

        {templates.map((templateUrl, index) => (
          <div
            key={index}
            onClick={() => setSelectedTemplate(templateUrl)}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
              selectedTemplate === templateUrl 
                ? 'ring-2 ring-offset-2 ring-[#6499E9] shadow-[0_0_15px_rgba(255,28,247,0.5)]' 
                : 'hover:scale-[1.02]'
            }`}
          >
            <div className="aspect-square relative">
              <img
                src={templateUrl}
                alt={`Template ${index + 1}`}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2 mt-4 pb-4">
        <Input
          type="text"
          placeholder="Title"
          className="w-full"
        />
        <Input
          type="text"
          placeholder="Subtitle"
          className="w-full"
        />
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

export function SelectTemplate({ 
  templatesUrls = [],
  title,
  subtitle,
  onTitleChange,
  onSubtitleChange,
  onTemplateSelect,
  originalImageUrl,
  currentTemplate,
  onUpdateTemplates,
  isGeneratingTemplates
}) {
  // Track the currently selected template
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);

  // Update selected template when current template or templates change
  useEffect(() => {
    if (currentTemplate === originalImageUrl) {
      // If current template is original image, show as "No Template"
      setSelectedTemplate(null);
    } else if (currentTemplate && templatesUrls.includes(currentTemplate)) {
      // If current template is in templates list, select it
      setSelectedTemplate(currentTemplate);
    } else if (!currentTemplate && originalImageUrl) {
      // If no template but we have original image, show as "No Template"
      setSelectedTemplate(null);
    }
  }, [currentTemplate, originalImageUrl, templatesUrls]);

  // Handle template selection
  const handleTemplateSelect = (templateUrl) => {
    // When selecting "No Template", we set the template to the original image URL
    const newTemplate = templateUrl === originalImageUrl ? originalImageUrl : templateUrl;
    setSelectedTemplate(templateUrl === originalImageUrl ? null : templateUrl);
    onTemplateSelect?.(newTemplate);
  };

  const NoTemplateBlock = () => (
    <div
      onClick={() => handleTemplateSelect(originalImageUrl)}
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
        selectedTemplate === null 
          ? 'ring-2 ring-offset-2 ring-[#6499E9] shadow-[0_0_15px_rgba(255,28,247,0.5)]' 
          : 'hover:scale-[1.02]'
      }`}
    >
      <div className="aspect-square relative bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        {originalImageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <div className="relative w-full h-full">
              <img
                src={originalImageUrl}
                alt="Original image"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400 font-medium">No Template</span>
        )}
      </div>
    </div>
  );

  const hasTemplates = templatesUrls && templatesUrls.length > 0;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="space-y-4 overflow-y-auto px-3 py-3 h-[60vh]">
        <NoTemplateBlock />

        {hasTemplates && templatesUrls.map((templateUrl, index) => (
          <div
            key={index}
            onClick={() => handleTemplateSelect(templateUrl)}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
              selectedTemplate === templateUrl 
                ? 'ring-2 ring-offset-2 ring-[#6499E9] shadow-[0_0_15px_rgba(255,28,247,0.5)]' 
                : 'hover:scale-[1.02]'
            }`}
          >
            <div className="aspect-square relative bg-gray-50 dark:bg-gray-800">
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <div className="relative w-full h-full">
                  <img
                    src={templateUrl}
                    alt={`Template ${index + 1}`}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasTemplates && (
        <div className="space-y-2 mt-3 h-[10vh] outline-none">
          <Input
            type="text"
            placeholder="Title"
            className="w-full outline-none bg-background"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            data-auto-dir="true"
          />
          <Textarea
            placeholder="Subtitle"
            className="w-full h-[11vh] outline-none bg-background"
            value={subtitle}
            onChange={(e) => onSubtitleChange?.(e.target.value)}
            data-auto-dir="true"
          />
          <Button 
            className='w-full'
            onClick={onUpdateTemplates}
            disabled={isGeneratingTemplates || !title || !subtitle || !originalImageUrl}
          >
            {isGeneratingTemplates ? 'Generating Templates...' : 'Update Templates'}
          </Button>
        </div>
      )}
    </div>
  );
};

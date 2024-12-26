import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Textarea } from '../ui/textarea';

export function SelectTemplate({ 
  templatesUrls = [],
  title,
  subtitle,
  onTitleChange,
  onSubtitleChange,
  onTemplateSelect,
  originalImageUrl,
  currentTemplate
}) {
  // Track the currently selected template
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Update selected template when current template or templates change
  useEffect(() => {
    console.log('Template state update:', {
      currentTemplate,
      originalImageUrl,
      templatesUrls,
      selectedTemplate
    });

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

  // Log template selection
  const handleTemplateSelect = (templateUrl) => {
    console.log('Selecting template:', {
      current: selectedTemplate,
      new: templateUrl,
      original: originalImageUrl
    });
    setSelectedTemplate(templateUrl);
    onTemplateSelect?.(templateUrl);
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
      <div className="aspect-square relative bg-gray-50 flex items-center justify-center">
        <span className="text-gray-500 font-medium">No Template</span>
      </div>
    </div>
  );

  const hasTemplates = templatesUrls && templatesUrls.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-4 overflow-y-auto px-3 py-3 h-[70vh]">
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
      {hasTemplates && (
        <div className="space-y-2 mt-3 h-[10vh] outline-none">
          <Input
            type="text"
            placeholder="Title"
            className="w-full outline-none"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
          />
          <Textarea
            placeholder="Subtitle"
            className="w-full h-36 outline-none"
            value={subtitle}
            onChange={(e) => onSubtitleChange?.(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

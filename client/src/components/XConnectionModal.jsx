import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from '@/lib/api';

const XConnectionModal = ({ isOpen, onClose, accountId }) => {
  const [formData, setFormData] = useState({
    webhookUrl: '',
    apiKey: '',
    apiSecret: '',
    accessToken: '',
    accessTokenSecret: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && accountId) {
      fetchExistingConnection();
    }
  }, [isOpen, accountId]);

  const fetchExistingConnection = async () => {
    try {
      const response = await api.getConnection(accountId);
      if (response?.X) {
        setFormData(response.X);
      }
    } catch (error) {
      console.error('Error fetching X connection:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'];
    
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        X: {
          apiKey: formData.apiKey.trim(),
          apiSecret: formData.apiSecret.trim(),
          accessToken: formData.accessToken.trim(),
          accessTokenSecret: formData.accessTokenSecret.trim()
        }
      };

      // Add webhookUrl only if it's not empty
      if (formData.webhookUrl?.trim()) {
        payload.X.webhookUrl = formData.webhookUrl.trim();
      }

      await api.updateConnection(accountId, payload);
      
      toast({
        title: "Success",
        description: "X connection updated successfully",
      });
      onClose();
    } catch (error) {
      console.error('Error updating X connection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update X connection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>X Platform Connection</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key (Consumer Key) *</Label>
            <Input
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleInputChange}
              placeholder="Enter API key"
              className={errors.apiKey ? 'border-red-500' : ''}
            />
            {errors.apiKey && <span className="text-sm text-red-500">{errors.apiKey}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiSecret">API Secret (Consumer Secret) *</Label>
            <Input
              id="apiSecret"
              name="apiSecret"
              type="password"
              value={formData.apiSecret}
              onChange={handleInputChange}
              placeholder="Enter API secret"
              className={errors.apiSecret ? 'border-red-500' : ''}
            />
            {errors.apiSecret && <span className="text-sm text-red-500">{errors.apiSecret}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accessToken">Access Token *</Label>
            <Input
              id="accessToken"
              name="accessToken"
              value={formData.accessToken}
              onChange={handleInputChange}
              placeholder="Enter access token"
              className={errors.accessToken ? 'border-red-500' : ''}
            />
            {errors.accessToken && <span className="text-sm text-red-500">{errors.accessToken}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accessTokenSecret">Access Token Secret *</Label>
            <Input
              id="accessTokenSecret"
              name="accessTokenSecret"
              type="password"
              value={formData.accessTokenSecret}
              onChange={handleInputChange}
              placeholder="Enter access token secret"
              className={errors.accessTokenSecret ? 'border-red-500' : ''}
            />
            {errors.accessTokenSecret && <span className="text-sm text-red-500">{errors.accessTokenSecret}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              name="webhookUrl"
              value={formData.webhookUrl}
              onChange={handleInputChange}
              placeholder="Enter webhook URL"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default XConnectionModal; 
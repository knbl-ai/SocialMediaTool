import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from '@/lib/api';

const ConnectionModal = ({ isOpen, onClose, platform, accountId }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [pageId, setPageId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ webhookUrl: '', pageId: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && platform && accountId) {
      fetchConnectionData();
    }
  }, [isOpen, platform, accountId]);

  const validateWebhookUrl = (url) => {
    const webhookPattern = /^https:\/\/hook\.eu2\.make\.com\/[a-zA-Z0-9]+$/;
    return webhookPattern.test(url);
  };

  const validatePageId = (id) => {
    const pageIdPattern = /^\d+$/;
    return pageIdPattern.test(id) && id.length > 10;
  };

  const handleWebhookUrlChange = (e) => {
    const url = e.target.value;
    setWebhookUrl(url);
    if (url && !validateWebhookUrl(url)) {
      setErrors(prev => ({
        ...prev,
        webhookUrl: 'Invalid webhook URL format. Should be like: https://hook.eu2.make.com/xyz...'
      }));
    } else {
      setErrors(prev => ({ ...prev, webhookUrl: '' }));
    }
  };

  const handlePageIdChange = (e) => {
    const id = e.target.value;
    setPageId(id);
    if (id && !validatePageId(id)) {
      setErrors(prev => ({
        ...prev,
        pageId: 'Invalid page ID format. Should be a long number like: 17841469060383508'
      }));
    } else {
      setErrors(prev => ({ ...prev, pageId: '' }));
    }
  };

  const fetchConnectionData = async () => {
    try {
      const connection = await api.getConnection(accountId);
      
      if (connection && connection[platform.name]) {
        setWebhookUrl(connection[platform.name].webhookUrl || '');
        setPageId(connection[platform.name].pageId || '');
      } else {
        setWebhookUrl('');
        setPageId('');
      }
    } catch (error) {
      console.error('Error fetching connection:', error);
      toast({
        title: "Error",
        description: "Failed to fetch connection data",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async () => {
    // Validate both fields before proceeding
    if (!validateWebhookUrl(webhookUrl) || !validatePageId(pageId)) {
      toast({
        title: "Validation Error",
        description: "Please check the webhook URL and page ID format",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.updateConnection(accountId, {
        platform: platform.name,
        webhookUrl,
        pageId
      });
      
      toast({
        title: "Success",
        description: `Connected to ${platform.name} successfully`,
      });
      onClose();
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Error",
        description: "Failed to connect platform",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await api.disconnectPlatform(accountId, platform.name);
      
      toast({
        title: "Success",
        description: `Disconnected from ${platform.name}`,
      });
      onClose();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect platform",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!platform) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {platform.name} Connection
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="webhook">Webhook URL</Label>
            <Input
              id="webhook"
              value={webhookUrl}
              onChange={handleWebhookUrlChange}
              placeholder="ex: https://hook.eu2.make.com/xyz..."
              disabled={isLoading}
              className={errors.webhookUrl ? 'border-red-500' : ''}
            />
            {errors.webhookUrl && (
              <p className="text-sm text-red-500">{errors.webhookUrl}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pageId">Page ID</Label>
            <Input
              id="pageId"
              value={pageId}
              onChange={handlePageIdChange}
              placeholder="ex: 15845467060883528"
              disabled={isLoading}
              className={errors.pageId ? 'border-red-500' : ''}
            />
            {errors.pageId && (
              <p className="text-sm text-red-500">{errors.pageId}</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isLoading || !webhookUrl || !pageId || errors.webhookUrl || errors.pageId}
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionModal; 
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

export default function PostNow({ accountId, post }) {
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    if (accountId) {
      fetchConnections();
    }
  }, [accountId]);

  const fetchConnections = async () => {
    try {
      const response = await api.getConnection(accountId);
      setConnections(response || {});
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch platform connections",
        variant: "destructive",
      });
    }
  };

  const isButtonEnabled = () => {
    if (!post?.platforms || post.platforms.length === 0) return false;
    
    // Check if all selected platforms are connected
    return post.platforms.every(platform => connections[platform]);
  };

  const handlePostNow = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement post now functionality
      toast({
        title: "Success",
        description: "Post scheduled for immediate publishing",
      });
    } catch (error) {
      console.error('Error posting:', error);
      toast({
        title: "Error",
        description: "Failed to publish post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full'>
      <Button
        variant="outline"
        className='w-full bg-violet-300'
        onClick={handlePostNow}
        disabled={!isButtonEnabled() || isLoading}
      >
        {isLoading ? 'Publishing...' : 'Post Now'}
      </Button>
    </div>
  );
}

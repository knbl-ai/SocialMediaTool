import React from 'react';
import { Clock, CalendarCheck, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";

const PostStatus = ({ className, currentStatus = 'pending', onStatusChange, disabled }) => {
  const handleClick = async () => {
    if (disabled) return;
    
    try {
      // Only toggle between pending and scheduled
      // If published or failed, set to scheduled first
      const newStatus = 
        currentStatus === 'pending' ? 'scheduled' : 
        currentStatus === 'scheduled' ? 'pending' : 
        'scheduled'; // Default to scheduled for published/failed
      
      await onStatusChange(newStatus);
      toast.success(`Post ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update post status');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative w-9 h-9",
        currentStatus === 'pending' 
          ? "text-orange-400 hover:text-orange-500" 
          : currentStatus === 'scheduled'
          ? "text-green-400 hover:text-green-500"
          : currentStatus === 'published'
          ? "text-blue-400 hover:text-blue-500"
          : currentStatus === 'failed'
          ? "text-red-400 hover:text-red-500"
          : "",
        className
      )}
    >
      {currentStatus === 'pending' && (
        <Clock className="h-4 w-4" />
      )}
      {currentStatus === 'scheduled' && (
        <CalendarCheck className="h-4 w-4" />
      )}
      {currentStatus === 'published' && (
        <Check className="h-4 w-4" />
      )}
      {currentStatus === 'failed' && (
        <AlertTriangle className="h-4 w-4" />
      )}
    </Button>
  );
};

export default PostStatus; 
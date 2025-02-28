import React from 'react';
import { Clock, CalendarCheck, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import api from '@/lib/api';

const PostStatus = ({ className, currentStatus = 'pending', onStatusChange, disabled, postId }) => {
  const handleClick = async (e) => {
    // Prevent the click from bubbling up to parent elements (which would open the edit modal)
    e.stopPropagation();
    
    if (disabled || !postId) return;
    
    try {
      // Only toggle between pending and scheduled
      // If published or failed, set to scheduled first
      const newStatus = 
        currentStatus === 'pending' ? 'scheduled' : 
        currentStatus === 'scheduled' ? 'pending' : 
        'scheduled'; // Default to scheduled for published/failed
      
      if (onStatusChange) {
        // Call onStatusChange with just the new status
        // The parent component will handle fetching the current post data
        await onStatusChange(newStatus);
        toast.success(`Post ${newStatus} successfully`);
      }
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
        "relative w-7 h-7 rounded-full p-0 flex items-center justify-center",
        currentStatus === 'pending' 
          ? "bg-orange-100/70 text-orange-500 hover:bg-orange-200/80 hover:text-orange-600" 
          : currentStatus === 'scheduled'
          ? "bg-green-100/70 text-green-500 hover:bg-green-200/80 hover:text-green-600"
          : currentStatus === 'published'
          ? "bg-blue-100/70 text-blue-500 hover:bg-blue-200/80 hover:text-blue-600"
          : currentStatus === 'failed'
          ? "bg-red-100/70 text-red-500 hover:bg-red-200/80 hover:text-red-600"
          : "",
        className
      )}
    >
      {currentStatus === 'pending' && (
        <Clock className="h-3.5 w-3.5" />
      )}
      {currentStatus === 'scheduled' && (
        <CalendarCheck className="h-3.5 w-3.5" />
      )}
      {currentStatus === 'published' && (
        <Check className="h-3.5 w-3.5" />
      )}
      {currentStatus === 'failed' && (
        <AlertTriangle className="h-3.5 w-3.5" />
      )}
    </Button>
  );
};

export default PostStatus; 
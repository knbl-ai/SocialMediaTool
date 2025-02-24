import React from 'react';
import { Clock, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";

const PostStatus = ({ className, currentStatus = 'pending', onStatusChange, disabled }) => {
  const handleClick = async () => {
    if (disabled) return;
    
    try {
      const newStatus = currentStatus === 'pending' ? 'scheduled' : 'pending';
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
          : "text-green-400 hover:text-green-500",
        className
      )}
    >
      {currentStatus === 'pending' ? (
        <Clock className="h-4 w-4" />
      ) : (
        <CalendarCheck className="h-4 w-4" />
      )}
    </Button>
  );
};

export default PostStatus; 
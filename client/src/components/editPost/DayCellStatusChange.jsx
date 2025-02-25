import React from 'react';
import { Check, Clock, CalendarCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DayCellStatusChange = ({ currentStatus = 'pending', className, onStatusChange, disabled }) => {
  const handleClick = async (e) => {
    // Prevent the click from bubbling up to the parent (which would open the edit modal)
    e.stopPropagation();
    
    if (disabled) return;
    
    try {
      // Only toggle between pending and scheduled
      // If published or failed, set to scheduled first
      const newStatus = 
        currentStatus === 'pending' ? 'scheduled' : 
        currentStatus === 'scheduled' ? 'pending' : 
        'scheduled'; // Default to scheduled for published/failed
        
      if (onStatusChange) {
        await onStatusChange(newStatus);
        toast.success(`Post ${newStatus} successfully`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update post status');
    }
  };

  return (
    <div 
      className={cn("absolute top-2 left-2 z-30", className)}
      onClick={onStatusChange ? handleClick : undefined}
      style={{ cursor: onStatusChange ? 'pointer' : 'default' }}
    >
      <div className={`p-1 rounded-full ${
        currentStatus === 'published' ? 'bg-blue-100 dark:bg-blue-900/30' :
        currentStatus === 'scheduled' ? 'bg-green-100 dark:bg-green-900/30' :
        currentStatus === 'pending' ? 'bg-orange-100 dark:bg-orange-900/30' :
        currentStatus === 'failed' ? 'bg-red-100 dark:bg-red-900/30' : ''
      }`}>
        {currentStatus === 'published' && (
          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        )}
        {currentStatus === 'scheduled' && (
          <CalendarCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
        )}
        {currentStatus === 'pending' && (
          <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
        )}
        {currentStatus === 'failed' && (
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        )}
      </div>
    </div>
  );
};

export default DayCellStatusChange; 
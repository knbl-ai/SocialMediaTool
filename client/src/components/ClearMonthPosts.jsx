import React, { useState } from 'react';
import { Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import api from '@/lib/api';

const ClearMonthPosts = ({ accountId, currentDate, onClear }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClear = async () => {
    try {
      setIsLoading(true);
      
      // Get first and last day of current month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      await api.post(`/posts/${accountId}/clear-month`, {
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0]
      });

      toast({
        title: "Success",
        description: "All posts for this month have been cleared",
      });

      // Close dialog and notify parent to refresh
      setIsDialogOpen(false);
      onClear?.();

    } catch (error) {
      console.error('Error clearing posts:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center mt-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          onClick={() => setIsDialogOpen(true)}
          disabled={isLoading}
        >
          <Eraser className="w-4 h-4" />
          {isLoading ? "Clearing..." : "Clear Month Posts"}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action will permanently delete all posts for the current month from all platforms.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isLoading ? "Clearing..." : "Clear All Posts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClearMonthPosts; 
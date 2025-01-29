import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

const OptimizeGuidelines = ({ accountId, onOptimize }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOptimize = async () => {
    try {
      setIsLoading(true);
      const response = await api.post(`/content-planner/${accountId}/optimize-guidelines`);
      
      if (response?.textGuidelines) {
        onOptimize(response.textGuidelines);
        toast({
          title: "Guidelines optimized",
          description: "Your content guidelines have been optimized with AI",
        });
      }
    } catch (error) {
      console.error('Error optimizing guidelines:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to optimize guidelines. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 p-0.5 hover:bg-accent hover:text-accent-foreground"
            onClick={handleOptimize}
            disabled={isLoading}
          >
            <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI Optimize Guidelines</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OptimizeGuidelines; 
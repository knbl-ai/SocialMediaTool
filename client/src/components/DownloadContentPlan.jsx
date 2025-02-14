import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useToast } from './ui/use-toast';
import api from '@/lib/api';

const PLATFORMS = [
  // { value: 'all', label: 'All Platforms' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' }
];

const DownloadContentPlan = ({ currentMonth = new Date(), accountId }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  // Get first and last day of the provided month
  const [startDate, setStartDate] = useState(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  );

  // Update dates when month changes
  useEffect(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, [currentMonth]);

  const handleDownload = async () => {
    if (!accountId) {
      toast({
        title: "Error",
        description: "Account ID is required",
        variant: "destructive",
      });
      return;
    }

    // Validate date range
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Error",
        description: "Start date cannot be after end date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Format dates as YYYY-MM-DD
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      const response = await api.downloadContentPlanPdf(
        accountId,
        formattedStartDate,
        formattedEndDate,
        selectedPlatform
      );
      
      // Create blob from response
      const blob = new Blob([response], { type: 'application/pdf' });
      
      // Verify the blob is not empty and is actually a PDF
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const platformName = selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1);
      link.setAttribute('download', `content-plan-${platformName.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Content plan PDF downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      let errorMessage = 'Failed to download content plan PDF';
      
      // Try to extract error message from response
      if (error.response?.data) {
        try {
          const text = await new Response(error.response.data).text();
          const data = JSON.parse(text);
          errorMessage = data.error || errorMessage;
        } catch (e) {
          // If parsing fails, use default message
          console.error('Failed to parse error response:', e);
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full mt-8 h-[200px] ">
      <CardContent className="p-6 mt-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(platform => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleDownload}
            className="px-8"
            disabled={isLoading}
          >
            {isLoading ? 'Downloading...' : 'Download PDF'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadContentPlan; 
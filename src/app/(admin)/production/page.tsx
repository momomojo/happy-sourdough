'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarIcon, Loader2, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductionList } from '@/components/admin/production/production-list';
import { ProductionSummary } from '@/components/admin/production/production-summary';
import type { ProductionListData } from '@/lib/supabase/admin/production';

export default function ProductionPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [productionData, setProductionData] = useState<ProductionListData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);
    setIsLoading(true);
    setError(null);

    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/admin/production?date=${dateStr}`);

      if (!response.ok) {
        throw new Error('Failed to fetch production data');
      }

      const data: ProductionListData = await response.json();
      setProductionData(data);
    } catch (err) {
      console.error('Error fetching production data:', err);
      setError('Failed to load production data. Please try again.');
      setProductionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-primary">Production List</h1>
            <p className="text-muted-foreground mt-1">
              View daily bake lists and production schedule
            </p>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {productionData && (
              <Button
                onClick={handlePrint}
                variant="outline"
                size="icon"
                title="Print production list"
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Print Header (only visible when printing) */}
        <div className="hidden print:block mb-8">
          <div className="border-b-2 border-primary pb-4 mb-6">
            <h1 className="text-4xl font-bold text-primary">Happy Sourdough</h1>
            <p className="text-2xl font-semibold mt-2">Production List</p>
            <p className="text-lg text-muted-foreground mt-1">
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading production data...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="p-8 bg-destructive/10 border-destructive">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-destructive font-semibold">Error</p>
              <p className="text-muted-foreground text-center">{error}</p>
            </div>
          </Card>
        )}

        {/* Production Data */}
        {!isLoading && !error && productionData && (
          <div className="flex flex-col gap-6">
            {/* Summary Stats */}
            <ProductionSummary stats={productionData.stats} />

            {/* Production List */}
            <ProductionList
              items={productionData.items}
              date={productionData.date}
            />

            {/* Empty State */}
            {productionData.items.length === 0 && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-lg font-semibold text-muted-foreground">
                    No orders scheduled
                  </p>
                  <p className="text-sm text-muted-foreground">
                    There are no orders for {format(selectedDate, 'MMMM d, yyyy')}
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Initial State */}
        {!isLoading && !error && !productionData && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center gap-2">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-semibold text-muted-foreground">
                Select a date to view production list
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

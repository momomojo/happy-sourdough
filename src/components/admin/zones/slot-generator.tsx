'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { generateTimeSlots, type TimeSlotCreateData } from '@/lib/supabase/admin/zones';
import { toast } from 'sonner';

interface SlotTemplate {
  id: string;
  window_start: string;
  window_end: string;
  slot_type: 'pickup' | 'delivery' | 'both';
  max_orders: number;
}

export function SlotGenerator() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [slotTemplates, setSlotTemplates] = useState<SlotTemplate[]>([
    {
      id: '1',
      window_start: '09:00',
      window_end: '11:00',
      slot_type: 'both',
      max_orders: 10,
    },
    {
      id: '2',
      window_start: '13:00',
      window_end: '15:00',
      slot_type: 'both',
      max_orders: 10,
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addSlotTemplate = () => {
    const newId = (Math.max(...slotTemplates.map((s) => parseInt(s.id)), 0) + 1).toString();
    setSlotTemplates([
      ...slotTemplates,
      {
        id: newId,
        window_start: '09:00',
        window_end: '11:00',
        slot_type: 'both',
        max_orders: 10,
      },
    ]);
  };

  const removeSlotTemplate = (id: string) => {
    setSlotTemplates(slotTemplates.filter((s) => s.id !== id));
  };

  const updateSlotTemplate = (id: string, updates: Partial<SlotTemplate>) => {
    setSlotTemplates(
      slotTemplates.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const calculateDaysCount = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    if (slotTemplates.length === 0) {
      toast.error('Please add at least one time slot template');
      return;
    }

    // Validate slot times
    for (const slot of slotTemplates) {
      if (slot.window_start >= slot.window_end) {
        toast.error('Start time must be before end time for all slots');
        return;
      }
      if (slot.max_orders <= 0) {
        toast.error('Max orders must be greater than 0 for all slots');
        return;
      }
    }

    setIsGenerating(true);

    try {
      const slots: TimeSlotCreateData[] = slotTemplates.map((template) => ({
        window_start: template.window_start,
        window_end: template.window_end,
        slot_type: template.slot_type,
        max_orders: template.max_orders,
      }));

      const count = await generateTimeSlots(startDate, endDate, slots);

      toast.success(
        `Successfully generated ${count} time slots (${calculateDaysCount()} days × ${
          slotTemplates.length
        } slots/day)`
      );

      // Reset form
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Error generating slots:', error);
      toast.error('Failed to generate time slots');
    } finally {
      setIsGenerating(false);
    }
  };

  const daysCount = calculateDaysCount();
  const totalSlots = daysCount * slotTemplates.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Bulk Time Slot Generator
        </CardTitle>
        <CardDescription>
          Create time slots for multiple dates at once. This will generate slots
          for each day in the date range.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Slot Templates */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Time Slot Templates</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSlotTemplate}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Slot
            </Button>
          </div>

          <div className="space-y-3">
            {slotTemplates.map((slot) => (
              <div
                key={slot.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="flex-1 grid grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor={`start-${slot.id}`} className="text-xs">
                      Start Time
                    </Label>
                    <Input
                      id={`start-${slot.id}`}
                      type="time"
                      value={slot.window_start}
                      onChange={(e) =>
                        updateSlotTemplate(slot.id, {
                          window_start: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`end-${slot.id}`} className="text-xs">
                      End Time
                    </Label>
                    <Input
                      id={`end-${slot.id}`}
                      type="time"
                      value={slot.window_end}
                      onChange={(e) =>
                        updateSlotTemplate(slot.id, {
                          window_end: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`type-${slot.id}`} className="text-xs">
                      Type
                    </Label>
                    <Select
                      value={slot.slot_type}
                      onValueChange={(value: 'pickup' | 'delivery' | 'both') =>
                        updateSlotTemplate(slot.id, { slot_type: value })
                      }
                    >
                      <SelectTrigger id={`type-${slot.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="pickup">Pickup Only</SelectItem>
                        <SelectItem value="delivery">Delivery Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`max-${slot.id}`} className="text-xs">
                      Max Orders
                    </Label>
                    <Input
                      id={`max-${slot.id}`}
                      type="number"
                      min="1"
                      value={slot.max_orders}
                      onChange={(e) =>
                        updateSlotTemplate(slot.id, {
                          max_orders: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSlotTemplate(slot.id)}
                  className="mt-5"
                  disabled={slotTemplates.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {startDate && endDate && daysCount > 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Generation Summary</p>
                <p className="text-sm text-muted-foreground">
                  {daysCount} days × {slotTemplates.length} slots/day
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {totalSlots} total slots
              </Badge>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !startDate || !endDate}
            size="lg"
          >
            {isGenerating ? 'Generating...' : 'Generate Time Slots'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

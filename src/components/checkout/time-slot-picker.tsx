'use client';

import { useState, useEffect } from 'react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  getAvailableTimeSlots,
  getBlackoutDates,
  type BlackoutDate,
} from '@/lib/supabase/delivery';
import type { TimeSlot, DeliveryType } from '@/types/database';
import { CalendarIcon, Clock, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlotPickerProps {
  deliveryType: DeliveryType;
  onSlotSelect: (slot: TimeSlot | null, date: Date | null) => void;
  hasCake?: boolean; // Whether order contains custom cake (requires 48h lead time)
}

export function TimeSlotPicker({ deliveryType, onSlotSelect, hasCake = false }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [blackoutDates, setBlackoutDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const leadTimeHours = hasCake ? 48 : 24;
  const minDate = addDays(new Date(), leadTimeHours / 24);
  const maxDate = addDays(new Date(), 14); // 14 days booking window

  // Load blackout dates on mount
  useEffect(() => {
    const loadBlackoutDates = async () => {
      const dates = await getBlackoutDates();
      const parsedDates = dates.map((d: BlackoutDate) => new Date(d.date));
      setBlackoutDates(parsedDates);
    };

    loadBlackoutDates();
  }, []);

  // Load time slots when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const loadTimeSlots = async () => {
      setLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const slots = await getAvailableTimeSlots(dateStr, deliveryType);
        setAvailableSlots(slots);

        // Clear selected slot if it's not in the new list
        if (selectedSlot && !slots.find(s => s.id === selectedSlot.id)) {
          setSelectedSlot(null);
          onSlotSelect(null, selectedDate);
        }
      } catch (error) {
        console.error('Error loading time slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimeSlots();
  }, [selectedDate, deliveryType]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    onSlotSelect(null, date || null);
    setCalendarOpen(false);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onSlotSelect(slot, selectedDate || null);
  };

  const isDateDisabled = (date: Date) => {
    // Disable if before minimum date
    if (isBefore(date, startOfDay(minDate))) {
      return true;
    }

    // Disable if after max booking window
    if (isBefore(maxDate, date)) {
      return true;
    }

    // Disable blackout dates
    return blackoutDates.some(
      (blackout) =>
        format(blackout, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    // Convert "08:00:00" to "8:00 AM"
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const getSlotsRemaining = (slot: TimeSlot) => {
    return (slot.max_orders ?? 0) - (slot.current_orders ?? 0);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">
          Select {deliveryType === 'pickup' ? 'Pickup' : 'Delivery'} Date & Time
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasCake
            ? 'Custom cakes require 48 hours advance notice'
            : 'Orders require 24 hours advance notice'}
        </p>
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label>Select Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-2">
          <Label>Select Time Window</Label>
          {loading ? (
            <Card>
              <CardContent className="py-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading available time slots...
                </span>
              </CardContent>
            </Card>
          ) : availableSlots.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No time slots available for this date.
                  <br />
                  Please select a different date.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-2">
              {availableSlots.map((slot) => {
                const slotsRemaining = getSlotsRemaining(slot);
                const isSelected = selectedSlot?.id === slot.id;
                const isLowAvailability = slotsRemaining <= 2;

                return (
                  <Card
                    key={slot.id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary',
                      isSelected && 'border-primary ring-2 ring-primary'
                    )}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">
                              {formatTimeRange(slot.window_start, slot.window_end)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {slotsRemaining} of {slot.max_orders} spots remaining
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          {isLowAvailability && (
                            <Badge variant="secondary" className="text-xs">
                              Limited
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selection Summary */}
      {selectedDate && selectedSlot && (
        <Card className="bg-primary/5 border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Selected Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTimeRange(selectedSlot.window_start, selectedSlot.window_end)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

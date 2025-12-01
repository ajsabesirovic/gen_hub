"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { saveAvailability, getAvailabilityForCurrentUser, type TimeRange, type WeeklySchedule, type MonthlySchedule } from "@/api/user";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Trash2, Clock, ChevronLeft, ChevronRight, Edit2, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const daysOfWeek = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
];

type AvailabilityMode = "weekly" | "monthly";

export default function AvailabilityManager() {
  const [mode, setMode] = useState<AvailabilityMode>("weekly");
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule[]>([]);
  const [monthlySchedule, setMonthlySchedule] = useState<MonthlySchedule[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateForTime, setSelectedDateForTime] = useState<string | null>(null);
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [tempTime, setTempTime] = useState({ from: "", to: "" });
  
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tempTimeRanges, setTempTimeRanges] = useState<TimeRange[]>([]);
  const [configuredDays, setConfiguredDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAvailability();
  }, []);

  const utcToLocalHhMm = (hhmm: string) => {
    if (!hhmm) return "";
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date(Date.UTC(1970, 0, 1, h, m, 0));
    const lh = d.getHours().toString().padStart(2, "0");
    const lm = d.getMinutes().toString().padStart(2, "0");
    return `${lh}:${lm}`;
  };

  const loadAvailability = async () => {
    setIsLoading(true);
    try {
      const data = await getAvailabilityForCurrentUser();
      if (data) {
        if (data.weeklySchedule) {
          const converted = data.weeklySchedule.map((item: any) => {
            if (item.timeRanges) {
              return {
                day: item.day,
                timeRanges: item.timeRanges.map((tr: any) => ({
                  id: tr.id,
                  from: utcToLocalHhMm(tr.from),
                  to: utcToLocalHhMm(tr.to),
                })),
              };
            }
            if (item.from && item.to) {
              return {
                day: item.day,
                timeRanges: [{ id: Date.now().toString(), from: utcToLocalHhMm(item.from), to: utcToLocalHhMm(item.to) }]
              };
            }
            return { day: item.day, timeRanges: [] };
          });
          setWeeklySchedule(converted);
          setConfiguredDays(new Set(converted.map((item: any) => item.day)));
        }

        const monthly = (data.monthlySchedule || []).map((m: any) => ({
          date: m.date,
          from: m.from ? utcToLocalHhMm(m.from) : "",
          to: m.to ? utcToLocalHhMm(m.to) : "",
        }));
        setMonthlySchedule(monthly);
        
        if (data.currentMonth) {
          setCurrentMonth(new Date(data.currentMonth));
        }
      }
    } catch (error) {
      console.error("Error loading availability:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = async (dayValue: string) => {
    const newWeeklySchedule = weeklySchedule.some((d) => d.day === dayValue)
      ? weeklySchedule.filter((d) => d.day !== dayValue)
      : [...weeklySchedule, { day: dayValue, timeRanges: [] }];
    
    setWeeklySchedule(newWeeklySchedule);
    
    try {
      await saveAvailability({
        mode: "weekly",
        weeklySchedule: newWeeklySchedule,
        monthlySchedule: [], 
        currentMonth: new Date().toISOString(),
      });
      toast.success("Availability saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error saving availability");
      console.error(error);
    }
  };

  const openEditDialog = (dayValue: string) => {
    const day = weeklySchedule.find((d) => d.day === dayValue);
    setTempTimeRanges(day?.timeRanges || []);
    setEditingDay(dayValue);
    setEditDialogOpen(true);
    setConfiguredDays(new Set(configuredDays).add(dayValue));
  };

  const isValidTimeRange = (from: string, to: string): boolean => {
    if (!from || !to) return true; 
    return from < to;
  };

  const saveEditDialog = async () => {
    if (!editingDay) return;
    
    for (const range of tempTimeRanges) {
      if (range.from && range.to && !isValidTimeRange(range.from, range.to)) {
        toast.error(`Invalid time range: ${range.from} - ${range.to}. Start time must be before end time.`);
        return;
      }
    }
    
    setWeeklySchedule(
      weeklySchedule.map((d) =>
        d.day === editingDay ? { ...d, timeRanges: tempTimeRanges } : d
      )
    );
    
    try {
      await saveAvailability({
        mode: "weekly",
        weeklySchedule: weeklySchedule.map((d) =>
          d.day === editingDay ? { ...d, timeRanges: tempTimeRanges } : d
        ),
        monthlySchedule: [],
        currentMonth: new Date().toISOString(),
      });
      toast.success("Availability saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error saving availability");
      console.error(error);
    }
    
    setEditDialogOpen(false);
    setEditingDay(null);
  };

  const addTimeRange = () => {
    setTempTimeRanges([...tempTimeRanges, { id: Date.now().toString(), from: "", to: "" }]);
  };

  const removeTimeRange = (id: string) => {
    setTempTimeRanges(tempTimeRanges.filter((tr) => tr.id !== id));
  };

  const updateTimeRange = (id: string, field: "from" | "to", value: string) => {
    setTempTimeRanges(
      tempTimeRanges.map((tr) => (tr.id === id ? { ...tr, [field]: value } : tr))
    );
  };

  const toggleMonthlyDate = async (dateString: string) => {
    const isSelected = monthlySchedule.some((d) => d.date === dateString);
    
    if (isSelected) {
      openTimeDialog(dateString);
    } else {
      const newMonthlySchedule = [...monthlySchedule, { date: dateString, from: "", to: "" }];
      setMonthlySchedule(newMonthlySchedule);
      openTimeDialog(dateString);
    }
  };

  const openTimeDialog = (dateString: string) => {
    const existing = monthlySchedule.find((d) => d.date === dateString);
    setTempTime(existing ? { from: existing.from, to: existing.to } : { from: "", to: "" });
    setSelectedDateForTime(dateString);
    setTimeDialogOpen(true);
  };

  const saveTimeForDate = async () => {
    if (!selectedDateForTime) return;
    
    if (tempTime.from && tempTime.to && !isValidTimeRange(tempTime.from, tempTime.to)) {
      toast.error(`Invalid time range: ${tempTime.from} - ${tempTime.to}. Start time must be before end time.`);
      return;
    }
    
    const updatedMonthlySchedule = monthlySchedule.map((d) =>
      d.date === selectedDateForTime ? { ...d, ...tempTime } : d
    );
    setMonthlySchedule(updatedMonthlySchedule);
    
    try {
      await saveAvailability({
        mode: "monthly",
        weeklySchedule: [],
        monthlySchedule: updatedMonthlySchedule,
        currentMonth: currentMonth.toISOString(),
      });
      toast.success("Availability saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error saving availability");
      console.error(error);
    }
    
    setTimeDialogOpen(false);
    setSelectedDateForTime(null);
  };

  const removeMonthlyDate = async (dateString: string) => {
    const newMonthlySchedule = monthlySchedule.filter((d) => d.date !== dateString);
    setMonthlySchedule(newMonthlySchedule);
    
    try {
      await saveAvailability({
        mode: "monthly",
        weeklySchedule: [],
        monthlySchedule: newMonthlySchedule,
        currentMonth: currentMonth.toISOString(),
      });
      toast.success("Date removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error saving availability");
      console.error(error);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const firstDayOfWeek = start.getDay();
    const emptyCells = Array(firstDayOfWeek).fill(null);
    
    return [...emptyCells, ...days];
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth();

  return (
    <div className="w-full">
      <div className="mb-6 text-left">
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-muted-foreground">
          {mode === "weekly" 
            ? "Choose the days in the week when you are available. Optionally set the time. You can add more time slots per day." 
            : "Choose the days and dates in the month when you are available. Optionally set the time. You can add more time slots per day or date."}
        </p>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as AvailabilityMode)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly">Weekly schedule</TabsTrigger>
          <TabsTrigger value="monthly">Monthly schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-6">
          <div className="flex flex-wrap items-center gap-4 md:gap-6 p-4 mb-6 bg-muted/30 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span><strong>Base schedule</strong> - Repeats weekly</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Empty = all-day availability</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span>Monthly overrides apply on specific dates</span>
            </div>
          </div>

          <Card>
            <CardContent>
              <div className="space-y-3">
          {daysOfWeek.map((day) => {
                  const selected = weeklySchedule.find((d) => d.day === day.value);
                  const hasTimeRanges = selected && selected.timeRanges.length > 0;
                  
            return (
              <div
                  key={day.value}
                  className={cn(
                        "flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-accent/50",
                        selected && "bg-primary/5"
                      )}
              >
                  <Checkbox
                    checked={!!selected}
                        onCheckedChange={() => toggleDay(day.value)}
                        className="h-5 w-5"
                      />
                      <Label className="text-base font-medium cursor-pointer flex-1">
                        {day.label}
                      </Label>
                      {selected && (
                        <div className="flex items-center gap-3">
                          {configuredDays.has(day.value) ? (
                            <>
                              {hasTimeRanges ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  {selected.timeRanges.map((tr) => (
                                    <div
                                      key={tr.id}
                                      className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-sm"
                                    >
                                      <Clock className="h-3 w-3" />
                                            <span>{tr.from} - {tr.to}</span> 
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground italic">
                                  Available whole day
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(day.value)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openEditDialog(day.value)}
                              className="flex items-center gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              <span>Set time</span>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <div className="flex items-center gap-6 p-4 mb-6 bg-muted/30 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span><strong>Monthly exceptions</strong> - Overrides weekly schedule</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Click date → set time → Save (empty = all-day)</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
            <CardContent>
                <div className="p-2">
                  <div className="flex items-center justify-between mb-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={previousMonth}
                      className="h-7 w-7"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="font-semibold text-sm">
                      {format(currentMonth, "MMMM yyyy")}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextMonth}
                      className="h-7 w-7"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-0.5">
                    {daysInMonth.map((date, idx) => {
                      if (!date) {
                        return <div key={`empty-${idx}`} className="aspect-square" />;
                      }
                      
                      const dateString = format(date, "yyyy-MM-dd");
                      const selected = monthlySchedule.some((d) => d.date === dateString);
                      const hasTime = monthlySchedule.find((d) => d.date === dateString && (d.from || d.to));
                      const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                      const isPast = date < new Date() && !isToday;
                      
                      return (
                        <button
                          key={dateString}
                          type="button"
                          onClick={() => toggleMonthlyDate(dateString)}
                          disabled={isPast}
                          className={cn(
                            "aspect-square p-0 text-xs rounded relative",
                            "transition-colors",
                            "disabled:opacity-30 disabled:cursor-not-allowed",
                            selected && !hasTime && "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer",
                            selected && hasTime && "bg-blue-500 text-white hover:bg-blue-600",
                            !selected && !isPast && "hover:bg-accent hover:text-accent-foreground",
                            !selected && isToday && "bg-accent font-semibold",
                          )}
                          title="Click to set availability"
                        >
                          {date.getDate()}
                          {selected && (
                            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/30 rounded-b" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {monthlySchedule.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <CalendarIcon className="h-8 w-8 opacity-50" />
                      </div>
                      <p className="font-medium mb-1">No exceptions scheduled</p>
                      <p className="text-sm">Your weekly schedule will apply for all dates</p>
                    </div>
                  ) : (
                    monthlySchedule
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((item) => {
                        const date = new Date(item.date);
                        const hasTime = item.from && item.to;
                        const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                        const isPast = date < new Date() && !isToday;
                        
                        return (
                          <div
                            key={item.date}
                            className={cn(
                              "group relative overflow-hidden rounded-xl border-0 bg-gradient-to-r p-4 transition-all duration-200 hover:shadow-md",
                              hasTime 
                                ? "from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 dark:from-blue-950/30 dark:to-blue-900/20" 
                                : "from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50 dark:from-green-950/30 dark:to-green-900/20",
                              isPast && "opacity-60"
                            )}
                          >
                            <div className={cn(
                              "absolute left-0 top-0 h-full w-1",
                              hasTime ? "bg-blue-500" : "bg-green-500"
                            )} />
                            
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-foreground">
                                        {format(date, "EEE")}
                                      </span>
                                      <span className="text-2xl font-bold text-foreground">
                                        {format(date, "dd")}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {format(date, "MMM yyyy")}
                                      </span>
                                    </div>
                                  </div>
                                  {isToday && (
                                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                      Today
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {hasTime ? (
                  <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 rounded-lg">
                                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                          {item.from} - {item.to}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 rounded-lg">
                                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                        All day available
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openTimeDialog(item.date)}
                                  className="h-8 w-8 p-0 hover:bg-white/50"
                                  title="Edit time"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeMonthlyDate(item.date)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  title="Remove date"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Set the time for {daysOfWeek.find((d) => d.value === editingDay)?.label}
            </DialogTitle>
            <DialogDescription>
              Add the time slots when you are available. If you don't add any slot, you will be available whole day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
            {tempTimeRanges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No additional time slots.</p>
                <p className="text-sm">You will be available whole day.</p>
              </div>
            ) : (
              tempTimeRanges.map((tr) => (
                <div key={tr.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={tr.from}
                      onChange={(e) => updateTimeRange(tr.id, "from", e.target.value)}
                      className="w-36"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="time"
                      value={tr.to}
                      onChange={(e) => updateTimeRange(tr.id, "to", e.target.value)}
                      className="w-36"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTimeRange(tr.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
                )}
              </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={addTimeRange}>
              <Plus className="h-4 w-4 mr-2" />
                Add time
            </Button>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveEditDialog}>Save</Button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

      <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set time</DialogTitle>
            {selectedDateForTime && (
              <>
                <p className="text-muted-foreground text-sm mb-1">
                  {format(new Date(selectedDateForTime), "EEEE, dd MMMM yyyy")}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Leave time empty for all-day availability, or set specific hours
                </p>
              </>
            )}
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Input
                type="time"
                value={tempTime.from}
                onChange={(e) => setTempTime({ ...tempTime, from: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                type="time"
                value={tempTime.to}
                onChange={(e) => setTempTime({ ...tempTime, to: e.target.value })}
              />
        </div>
      </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTimeForDate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}


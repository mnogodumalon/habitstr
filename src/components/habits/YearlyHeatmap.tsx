import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, isSameDay, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Habit } from './HabitItem';

interface YearlyHeatmapProps {
  habits: Habit[];
  year: number;
}

const monthLabels = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const dayLabels = ['Mo', '', 'Mi', '', 'Fr', '', ''];

export function YearlyHeatmap({ habits, year }: YearlyHeatmapProps) {
  const { days, completionMap } = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(new Date(year, 0, 1));
    const allDays = eachDayOfInterval({ start, end });

    // Calculate completion for each day
    const map = new Map<string, { completed: number; total: number }>();

    allDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const completed = habits.filter(h => h.completedDates.includes(dateStr)).length;
      map.set(dateStr, { completed, total: habits.length });
    });

    return { days: allDays, completionMap: map };
  }, [habits, year]);

  // Group days by week
  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    // Add padding for the first week
    const firstDay = days[0];
    const firstDayOfWeek = getDay(firstDay);
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = 0; i < mondayOffset; i++) {
      currentWeek.push(null);
    }

    days.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      result.push(currentWeek);
    }

    return result;
  }, [days]);

  const getLevel = (completed: number, total: number): number => {
    if (total === 0 || completed === 0) return 0;
    const ratio = completed / total;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const levelColors = [
    'bg-[var(--habit-level-0)]',
    'bg-[var(--habit-level-1)]',
    'bg-[var(--habit-level-2)]',
    'bg-[var(--habit-level-3)]',
    'bg-[var(--habit-level-4)]',
  ];

  // Calculate month positions for labels
  const monthPositions = useMemo(() => {
    const positions: { month: number; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const validDay = week.find(d => d !== null);
      if (validDay) {
        const month = validDay.getMonth();
        if (month !== lastMonth) {
          positions.push({ month, weekIndex });
          lastMonth = month;
        }
      }
    });

    return positions;
  }, [weeks]);

  const today = new Date();

  return (
    <TooltipProvider delayDuration={100}>
      <div className="animate-fade-in">
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] pr-2 text-xs text-muted-foreground">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-[12px] flex items-center justify-end">
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex-1 overflow-x-auto">
            {/* Month labels */}
            <div className="flex mb-1 text-xs text-muted-foreground">
              {monthPositions.map(({ month, weekIndex }, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ marginLeft: `${weekIndex * 15}px` }}
                >
                  {monthLabels[month]}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px] mt-6">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={dayIndex}
                          className="w-[12px] h-[12px]"
                        />
                      );
                    }

                    const dateStr = format(day, 'yyyy-MM-dd');
                    const data = completionMap.get(dateStr);
                    const level = data ? getLevel(data.completed, data.total) : 0;
                    const isToday = isSameDay(day, today);

                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-[12px] h-[12px] rounded-sm heatmap-cell cursor-pointer",
                              levelColors[level],
                              isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          <p className="font-medium">
                            {format(day, 'EEEE, d. MMMM yyyy', { locale: de })}
                          </p>
                          <p className="text-muted-foreground">
                            {data?.completed || 0} von {data?.total || 0} Gewohnheiten erledigt
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Weniger</span>
          {levelColors.map((color, i) => (
            <div
              key={i}
              className={cn("w-[12px] h-[12px] rounded-sm", color)}
            />
          ))}
          <span>Mehr</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

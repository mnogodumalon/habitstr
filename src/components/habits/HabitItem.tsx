import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface Habit {
  id: string;
  name: string;
  category: string;
  completedDates: string[];
}

interface HabitItemProps {
  habit: Habit;
  date: string;
  onToggle: (habitId: string, date: string) => void;
}

export function HabitItem({ habit, date, onToggle }: HabitItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const isCompleted = habit.completedDates.includes(date);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle(habit.id, date);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
        "hover:bg-secondary/50 cursor-pointer group",
        isCompleted && "bg-secondary/30"
      )}
      onClick={handleToggle}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggle}
        className={cn(
          "h-5 w-5 transition-all",
          isAnimating && "animate-habit-check",
          isCompleted && "animate-habit-glow"
        )}
      />
      <span className={cn(
        "text-sm font-medium transition-all duration-200",
        isCompleted && "text-muted-foreground line-through"
      )}>
        {habit.name}
      </span>
      {isCompleted && (
        <span className="ml-auto text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Erledigt!
        </span>
      )}
    </div>
  );
}

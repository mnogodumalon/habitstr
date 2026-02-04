import { cn } from '@/lib/utils';
import { HabitItem, type Habit } from './HabitItem';
import { Badge } from '@/components/ui/badge';

interface CategorySectionProps {
  category: string;
  habits: Habit[];
  date: string;
  onToggle: (habitId: string, date: string) => void;
  index: number;
}

const categoryIcons: Record<string, string> = {
  Gesundheit: '🌿',
  Produktivität: '⚡',
  Achtsamkeit: '🧘',
  Fitness: '💪',
  Lernen: '📚',
};

const categoryColors: Record<string, string> = {
  Gesundheit: 'bg-[var(--category-health)]',
  Produktivität: 'bg-[var(--category-productivity)]',
  Achtsamkeit: 'bg-[var(--category-mindfulness)]',
  Fitness: 'bg-[var(--category-fitness)]',
  Lernen: 'bg-[var(--category-learning)]',
};

export function CategorySection({ category, habits, date, onToggle, index }: CategorySectionProps) {
  const completedCount = habits.filter(h => h.completedDates.includes(date)).length;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  return (
    <div
      className="animate-slide-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryIcons[category] || '📌'}</span>
          <h3 className="font-semibold text-foreground">{category}</h3>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs px-2 py-0.5 text-primary-foreground",
              categoryColors[category] || 'bg-primary'
            )}
          >
            {completedCount}/{habits.length}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            categoryColors[category] || 'bg-primary'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-1">
        {habits.map((habit) => (
          <HabitItem
            key={habit.id}
            habit={habit}
            date={date}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

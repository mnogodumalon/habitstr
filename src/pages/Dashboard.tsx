import { useState, useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Target, TrendingUp, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategorySection } from '@/components/habits/CategorySection';
import { YearlyHeatmap } from '@/components/habits/YearlyHeatmap';
import { AddHabitDialog } from '@/components/habits/AddHabitDialog';
import type { Habit } from '@/components/habits/HabitItem';

// Initial sample habits
const initialHabits: Habit[] = [
  { id: '1', name: '8 Gläser Wasser trinken', category: 'Gesundheit', completedDates: [] },
  { id: '2', name: 'Obst oder Gemüse essen', category: 'Gesundheit', completedDates: [] },
  { id: '3', name: '10 Minuten meditieren', category: 'Achtsamkeit', completedDates: [] },
  { id: '4', name: 'Tagebuch schreiben', category: 'Achtsamkeit', completedDates: [] },
  { id: '5', name: '30 Minuten Sport', category: 'Fitness', completedDates: [] },
  { id: '6', name: '10.000 Schritte gehen', category: 'Fitness', completedDates: [] },
  { id: '7', name: '30 Minuten lesen', category: 'Lernen', completedDates: [] },
  { id: '8', name: 'Neue Vokabeln lernen', category: 'Lernen', completedDates: [] },
  { id: '9', name: 'To-Do Liste abarbeiten', category: 'Produktivität', completedDates: [] },
  { id: '10', name: 'E-Mails bearbeiten', category: 'Produktivität', completedDates: [] },
];

const categories = ['Gesundheit', 'Achtsamkeit', 'Fitness', 'Lernen', 'Produktivität'];

// Generate some mock completed dates for demo
const generateMockData = (habits: Habit[]): Habit[] => {
  const today = new Date();
  return habits.map(habit => {
    const completedDates: string[] = [];
    // Random completion for last 60 days
    for (let i = 0; i < 60; i++) {
      if (Math.random() > 0.4) {
        completedDates.push(format(subDays(today, i), 'yyyy-MM-dd'));
      }
    }
    return { ...habit, completedDates };
  });
};

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>(() => generateMockData(initialHabits));
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const displayDate = format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de });
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

  // Group habits by category
  const habitsByCategory = useMemo(() => {
    const grouped: Record<string, Habit[]> = {};
    categories.forEach(cat => {
      grouped[cat] = habits.filter(h => h.category === cat);
    });
    return grouped;
  }, [habits]);

  // Stats
  const stats = useMemo(() => {
    const todayCompleted = habits.filter(h => h.completedDates.includes(dateStr)).length;
    const totalHabits = habits.length;

    // Calculate streak
    let streak = 0;
    let currentDate = new Date();
    while (true) {
      const checkDate = format(currentDate, 'yyyy-MM-dd');
      const allCompleted = habits.every(h => h.completedDates.includes(checkDate));
      if (allCompleted && habits.length > 0) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    // Calculate completion rate for last 7 days
    let totalPossible = 0;
    let totalCompleted = 0;
    for (let i = 0; i < 7; i++) {
      const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
      habits.forEach(h => {
        totalPossible++;
        if (h.completedDates.includes(checkDate)) {
          totalCompleted++;
        }
      });
    }
    const weeklyRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return { todayCompleted, totalHabits, streak, weeklyRate };
  }, [habits, dateStr]);

  const handleToggle = (habitId: string, date: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id !== habitId) return habit;
      const isCompleted = habit.completedDates.includes(date);
      return {
        ...habit,
        completedDates: isCompleted
          ? habit.completedDates.filter(d => d !== date)
          : [...habit.completedDates, date]
      };
    }));
  };

  const handleAddHabit = (name: string, category: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      category,
      completedDates: [],
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gewohnheitstracker
          </h1>
          <p className="text-muted-foreground">
            Baue positive Gewohnheiten auf und verfolge deinen Fortschritt
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.todayCompleted}/{stats.totalHabits}
                  </p>
                  <p className="text-xs text-muted-foreground">Heute erledigt</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--category-fitness)]/20 rounded-lg">
                  <Flame className="h-5 w-5 text-[var(--category-fitness)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.streak}
                  </p>
                  <p className="text-xs text-muted-foreground">Tage Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--category-productivity)]/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-[var(--category-productivity)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.weeklyRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Diese Woche</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '250ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--category-mindfulness)]/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-[var(--category-mindfulness)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {habits.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Gewohnheiten</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="daily">Tagesansicht</TabsTrigger>
            <TabsTrigger value="yearly">Jahresübersicht</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            {/* Date Navigator */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('prev')}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <div className="text-center">
                    <p className="font-semibold text-foreground">{displayDate}</p>
                    {isToday && (
                      <span className="text-xs text-primary font-medium">Heute</span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('next')}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Habits by Category */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Deine Gewohnheiten</h2>
              <AddHabitDialog onAdd={handleAddHabit} categories={categories} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {categories.map((category, index) => {
                const categoryHabits = habitsByCategory[category];
                if (categoryHabits.length === 0) return null;
                return (
                  <Card key={category}>
                    <CardContent className="pt-6">
                      <CategorySection
                        category={category}
                        habits={categoryHabits}
                        date={dateStr}
                        onToggle={handleToggle}
                        index={index}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="yearly">
            <Card>
              <CardHeader>
                <CardTitle>Jahresübersicht {selectedDate.getFullYear()}</CardTitle>
                <CardDescription>
                  Dein Fortschritt über das gesamte Jahr hinweg
                </CardDescription>
              </CardHeader>
              <CardContent>
                <YearlyHeatmap habits={habits} year={selectedDate.getFullYear()} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

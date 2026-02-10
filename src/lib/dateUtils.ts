// Utility functions for date calculations used in notifications

export function calculateDaysUntil(targetDate: Date): number {
  const now = new Date();
  return Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isToday(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  return targetDate >= todayStart && targetDate < todayEnd;
}

export function getAirDateStatus(airDate: string | Date): string {
  const targetDate = typeof airDate === 'string' ? new Date(airDate) : airDate;
  const daysUntil = calculateDaysUntil(targetDate);

  if (daysUntil < 0) return "Already Aired";
  if (daysUntil === 0) return "Airing Today";
  if (daysUntil === 1) return "Airing Tomorrow";
  if (daysUntil <= 7) return `Airing in ${daysUntil} days`;
  if (daysUntil <= 30) return `Airing in ${Math.ceil(daysUntil / 7)} weeks`;
  return "Coming Soon";
}

export function getAirDateColor(airDate: string | Date): string {
  const targetDate = typeof airDate === 'string' ? new Date(airDate) : airDate;
  const daysUntil = calculateDaysUntil(targetDate);

  if (daysUntil < 0) return "bg-gray-500";
  if (daysUntil <= 1) return "bg-red-500";
  if (daysUntil <= 3) return "bg-orange-500";
  if (daysUntil <= 7) return "bg-blue-500";
  if (daysUntil <= 30) return "bg-purple-500";
  return "bg-gray-500";
}

export function runDateUtilityTests() {
  const tests = [
    {
      name: 'calculateDaysUntil - tomorrow',
      test: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return calculateDaysUntil(tomorrow) === 1;
      }
    },
    {
      name: 'calculateDaysUntil - today',
      test: () => {
        const laterToday = new Date(Date.now() + 60 * 60 * 1000);
        return calculateDaysUntil(laterToday) === 0;
      }
    },
    {
      name: 'calculateDaysUntil - yesterday',
      test: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return calculateDaysUntil(yesterday) === -1;
      }
    }
  ];
}

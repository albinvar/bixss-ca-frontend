"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface YearSelectorProps {
  availableYears: string[];
  selectedYear: string;
  onChange: (year: string) => void;
}

export function YearSelector({ availableYears, selectedYear, onChange }: YearSelectorProps) {
  if (!availableYears || availableYears.length === 0) {
    return null;
  }

  // Sort years in descending order (newest first)
  const sortedYears = [...availableYears].sort((a, b) => parseInt(b) - parseInt(a));

  // Get the year that will be shown as "Previous Year"
  const selectedIndex = sortedYears.indexOf(selectedYear);
  const previousYear = selectedIndex < sortedYears.length - 1 ? sortedYears[selectedIndex + 1] : null;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200/60 dark:border-indigo-800/60 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg shadow-md">
          <Calendar className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Select Year:
        </span>
      </div>

      <Select value={selectedYear} onValueChange={onChange}>
        <SelectTrigger className="w-40 rounded-lg border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 font-semibold">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {sortedYears.map((year) => (
            <SelectItem key={year} value={year} className="font-medium">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span>Viewing:</span>
        <Badge variant="default" className="bg-indigo-600">
          {selectedYear}
        </Badge>
        {previousYear && (
          <>
            <span>vs</span>
            <Badge variant="secondary">
              {previousYear}
            </Badge>
          </>
        )}
      </div>

      {availableYears.length > 2 && (
        <Badge variant="outline" className="ml-auto border-indigo-300 dark:border-indigo-700">
          {availableYears.length} years available
        </Badge>
      )}
    </div>
  );
}

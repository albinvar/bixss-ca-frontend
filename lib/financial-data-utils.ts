/**
 * Utilities for handling dynamic multi-year financial data
 * All data is stored as year-keyed objects: {"2024": value, "2023": value, "2022": value}
 */

/**
 * Gets value for a specific year from year-keyed data
 * @param data - Year-keyed object {"2024": val, "2023": val}
 * @param year - The year to get value for
 * @returns The value for the specified year or null
 */
export function getYearValue(data: any, year: string): number | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data[year] ?? null;
}

/**
 * Gets values for current and previous year (for comparison)
 * @param data - Year-keyed object
 * @param selectedYear - Currently selected year
 * @param availableYears - Sorted array of available years (newest first)
 * @returns Object with current and previous values
 */
export function getComparisonYears(
  data: any,
  selectedYear: string,
  availableYears: string[]
): { current: number | null; previous: number | null } {
  if (!data || !availableYears || availableYears.length === 0) {
    return { current: null, previous: null };
  }

  const selectedIndex = availableYears.indexOf(selectedYear);
  const previousYear = availableYears[selectedIndex + 1] || null;

  return {
    current: getYearValue(data, selectedYear),
    previous: previousYear ? getYearValue(data, previousYear) : null,
  };
}

/**
 * Calculates percentage change between two values
 */
export function calculateChange(current: number | null, previous: number | null): number | null {
  if (!current || !previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Formats currency value
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `₹${(value / 100000).toFixed(2)}L`;
}

/**
 * Gets display labels for selected years
 */
export function getYearLabels(
  selectedYear: string,
  availableYears: string[]
): { current: string; previous: string | null } {
  const selectedIndex = availableYears.indexOf(selectedYear);
  const previousYear = availableYears[selectedIndex + 1] || null;

  return {
    current: selectedYear,
    previous: previousYear,
  };
}

/**
 * Extracts metric value for a specific year from metric data
 */
export function getMetricYearValue(
  metricData: any,
  year: string
): number | string | null {
  if (!metricData || !metricData.values) return null;

  const value = metricData.values[year];
  if (value === undefined || value === null) return null;

  return value;
}

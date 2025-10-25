import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DynamicFinancialTableProps {
  title: string;
  description?: string;
  extractedFields: Record<string, Record<string, number>>;
  standardizedFields?: Record<string, {
    source_field: string;
    values: Record<string, number>;
    category: string;
  }>;
  availableYears: string[];
  section: 'balance_sheet' | 'income_statement';
}

export function DynamicFinancialTable({
  title,
  description,
  extractedFields,
  standardizedFields,
  availableYears,
  section
}: DynamicFinancialTableProps) {

  // Get fields for this section
  const sectionFields = extractedFields || {};

  // Helper to format numbers with currency
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Helper to format field name for display
  const formatFieldName = (fieldName: string): string => {
    // Capitalize first letter of each word
    return fieldName
      .split(/(?=[A-Z])|_|\s/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper to find if this field has a standard mapping
  const findStandardMapping = (originalFieldName: string): {
    standardName: string;
    category: string;
  } | null => {
    if (!standardizedFields) return null;

    for (const [standardName, data] of Object.entries(standardizedFields)) {
      if (data.source_field === originalFieldName) {
        return { standardName, category: data.category };
      }
    }
    return null;
  };

  if (!Object.keys(sectionFields).length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Line Item</TableHead>
                {availableYears.map(year => (
                  <TableHead key={year} className="text-right">
                    {year}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(sectionFields).map(([fieldName, yearValues]) => {
                const mapping = findStandardMapping(fieldName);

                return (
                  <TableRow key={fieldName}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{fieldName}</span>

                        {mapping && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="text-xs">
                                  {formatFieldName(mapping.standardName)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  Mapped to: <strong>{formatFieldName(mapping.standardName)}</strong>
                                  <br />
                                  Category: {mapping.category.replace(/_/g, ' ')}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>

                    {availableYears.map(year => (
                      <TableCell key={year} className="text-right font-mono">
                        {formatNumber(yearValues[year])}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

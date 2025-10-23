"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Settings,
  Target,
  Activity,
  DollarSign,
  Scale,
  BarChart3,
  Save,
  RotateCw
} from 'lucide-react';
import { benchmarksApi } from '@/lib/api';

export default function BenchmarksPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [formData, setFormData] = useState<any>(getDefaultFormData());

  // Redirect if not CA
  useEffect(() => {
    if (user && user.role !== 'ca') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchBenchmark();
  }, []);

  function getDefaultFormData() {
    return {
      liquidityRatios: {
        currentRatio: { excellent: 2.5, good: 2.0, fair: 1.5, poor: 1.0 },
        quickRatio: { excellent: 1.5, good: 1.2, fair: 1.0, poor: 0.7 },
        cashRatio: { excellent: 0.5, good: 0.3, fair: 0.2, poor: 0.1 }
      },
      profitabilityRatios: {
        grossMargin: { excellent: 40, good: 30, fair: 20, poor: 10 },
        operatingMargin: { excellent: 20, good: 15, fair: 10, poor: 5 },
        netMargin: { excellent: 15, good: 10, fair: 5, poor: 2 },
        roa: { excellent: 10, good: 7, fair: 5, poor: 2 },
        roe: { excellent: 20, good: 15, fair: 10, poor: 5 }
      },
      leverageRatios: {
        debtToEquity: { excellent: 0.5, good: 1.0, fair: 1.5, poor: 2.0 },
        debtToAssets: { excellent: 30, good: 40, fair: 50, poor: 60 },
        interestCoverage: { excellent: 8, good: 5, fair: 3, poor: 2 }
      },
      efficiencyRatios: {
        assetTurnover: { excellent: 2.0, good: 1.5, fair: 1.0, poor: 0.5 },
        inventoryTurnover: { excellent: 12, good: 8, fair: 6, poor: 4 },
        receivablesTurnover: { excellent: 12, good: 8, fair: 6, poor: 4 }
      }
    };
  }

  const fetchBenchmark = async () => {
    try {
      setIsLoading(true);
      // Try to get the default General benchmark
      const response = await benchmarksApi.getDefault('General');
      if (response.success && response.data.benchmark) {
        setBenchmark(response.data.benchmark);
        setFormData({
          liquidityRatios: response.data.benchmark.liquidityRatios,
          profitabilityRatios: response.data.benchmark.profitabilityRatios,
          leverageRatios: response.data.benchmark.leverageRatios,
          efficiencyRatios: response.data.benchmark.efficiencyRatios
        });
      }
    } catch (error) {
      console.error('Error fetching benchmark:', error);
      // If no benchmark exists, we'll use the default form values
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (benchmark) {
        // Update existing benchmark
        await benchmarksApi.update(benchmark._id, formData);
        toast.success('Benchmark values updated successfully');
      } else {
        // Create new benchmark (Super Admin only can create defaults)
        await benchmarksApi.create({
          name: 'General Industry Benchmark',
          industry: 'General',
          isDefault: false,
          ...formData
        });
        toast.success('Benchmark configuration saved successfully');
      }

      fetchBenchmark();
    } catch (error: any) {
      console.error('Error saving benchmark:', error);
      toast.error(error.response?.data?.message || 'Failed to save benchmark');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset to default values? This will discard your changes.')) {
      setFormData(getDefaultFormData());
      toast.success('Reset to default values');
    }
  };

  const updateRatioValue = (category: string, metric: string, level: string, value: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [metric]: {
          ...prev[category][metric],
          [level]: value
        }
      }
    }));
  };

  if (!user || user.role !== 'ca') {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-7 w-7" />
            Benchmark Configuration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure financial ratio benchmark values used for analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            These benchmark values are used by the AI to classify company financial ratios as
            <span className="font-semibold text-green-600 mx-1">Excellent</span>,
            <span className="font-semibold text-blue-600 mx-1">Good</span>,
            <span className="font-semibold text-orange-600 mx-1">Fair</span>, or
            <span className="font-semibold text-red-600 mx-1">Poor</span> during analysis.
          </p>
        </CardContent>
      </Card>

      {/* Configuration */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ratio Benchmarks</CardTitle>
            <CardDescription>
              Adjust threshold values for each financial ratio category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="liquidity" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="liquidity">
                  <Activity className="h-4 w-4 mr-2" />
                  Liquidity
                </TabsTrigger>
                <TabsTrigger value="profitability">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Profitability
                </TabsTrigger>
                <TabsTrigger value="leverage">
                  <Scale className="h-4 w-4 mr-2" />
                  Leverage
                </TabsTrigger>
                <TabsTrigger value="efficiency">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Efficiency
                </TabsTrigger>
              </TabsList>

              {/* Liquidity Ratios */}
              <TabsContent value="liquidity" className="space-y-4 mt-4">
                <RatioConfigSection
                  title="Current Ratio"
                  values={formData.liquidityRatios.currentRatio}
                  onChange={(level, value) => updateRatioValue('liquidityRatios', 'currentRatio', level, value)}
                />
                <RatioConfigSection
                  title="Quick Ratio"
                  values={formData.liquidityRatios.quickRatio}
                  onChange={(level, value) => updateRatioValue('liquidityRatios', 'quickRatio', level, value)}
                />
                <RatioConfigSection
                  title="Cash Ratio"
                  values={formData.liquidityRatios.cashRatio}
                  onChange={(level, value) => updateRatioValue('liquidityRatios', 'cashRatio', level, value)}
                />
              </TabsContent>

              {/* Profitability Ratios */}
              <TabsContent value="profitability" className="space-y-4 mt-4">
                <RatioConfigSection
                  title="Gross Margin (%)"
                  values={formData.profitabilityRatios.grossMargin}
                  onChange={(level, value) => updateRatioValue('profitabilityRatios', 'grossMargin', level, value)}
                />
                <RatioConfigSection
                  title="Operating Margin (%)"
                  values={formData.profitabilityRatios.operatingMargin}
                  onChange={(level, value) => updateRatioValue('profitabilityRatios', 'operatingMargin', level, value)}
                />
                <RatioConfigSection
                  title="Net Margin (%)"
                  values={formData.profitabilityRatios.netMargin}
                  onChange={(level, value) => updateRatioValue('profitabilityRatios', 'netMargin', level, value)}
                />
                <RatioConfigSection
                  title="ROA (%)"
                  values={formData.profitabilityRatios.roa}
                  onChange={(level, value) => updateRatioValue('profitabilityRatios', 'roa', level, value)}
                />
                <RatioConfigSection
                  title="ROE (%)"
                  values={formData.profitabilityRatios.roe}
                  onChange={(level, value) => updateRatioValue('profitabilityRatios', 'roe', level, value)}
                />
              </TabsContent>

              {/* Leverage Ratios */}
              <TabsContent value="leverage" className="space-y-4 mt-4">
                <RatioConfigSection
                  title="Debt-to-Equity"
                  values={formData.leverageRatios.debtToEquity}
                  onChange={(level, value) => updateRatioValue('leverageRatios', 'debtToEquity', level, value)}
                />
                <RatioConfigSection
                  title="Debt-to-Assets (%)"
                  values={formData.leverageRatios.debtToAssets}
                  onChange={(level, value) => updateRatioValue('leverageRatios', 'debtToAssets', level, value)}
                />
                <RatioConfigSection
                  title="Interest Coverage"
                  values={formData.leverageRatios.interestCoverage}
                  onChange={(level, value) => updateRatioValue('leverageRatios', 'interestCoverage', level, value)}
                />
              </TabsContent>

              {/* Efficiency Ratios */}
              <TabsContent value="efficiency" className="space-y-4 mt-4">
                <RatioConfigSection
                  title="Asset Turnover"
                  values={formData.efficiencyRatios.assetTurnover}
                  onChange={(level, value) => updateRatioValue('efficiencyRatios', 'assetTurnover', level, value)}
                />
                <RatioConfigSection
                  title="Inventory Turnover"
                  values={formData.efficiencyRatios.inventoryTurnover}
                  onChange={(level, value) => updateRatioValue('efficiencyRatios', 'inventoryTurnover', level, value)}
                />
                <RatioConfigSection
                  title="Receivables Turnover"
                  values={formData.efficiencyRatios.receivablesTurnover}
                  onChange={(level, value) => updateRatioValue('efficiencyRatios', 'receivablesTurnover', level, value)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component for ratio configuration
function RatioConfigSection({
  title,
  values,
  onChange
}: {
  title: string;
  values: { excellent: number; good: number; fair: number; poor: number };
  onChange: (level: string, value: number) => void;
}) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-3">{title}</h4>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <Label className="text-xs text-green-600">Excellent</Label>
          <Input
            type="number"
            step="0.1"
            value={values.excellent}
            onChange={(e) => onChange('excellent', parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-blue-600">Good</Label>
          <Input
            type="number"
            step="0.1"
            value={values.good}
            onChange={(e) => onChange('good', parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-orange-600">Fair</Label>
          <Input
            type="number"
            step="0.1"
            value={values.fair}
            onChange={(e) => onChange('fair', parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-red-600">Poor</Label>
          <Input
            type="number"
            step="0.1"
            value={values.poor}
            onChange={(e) => onChange('poor', parseFloat(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

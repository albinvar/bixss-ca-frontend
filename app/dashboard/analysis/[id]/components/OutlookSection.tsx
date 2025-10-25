import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Target,
  Shield,
  BarChart3,
} from 'lucide-react';

interface OutlookSectionProps {
  healthAnalysis: any;
  trendAnalysis: any;
  riskAssessment: any;
  industryBench: any;
  graphicalData?: any;
  futureOutlook?: any;
}

export function OutlookSection({
  healthAnalysis,
  trendAnalysis,
  riskAssessment,
  industryBench,
  graphicalData,
  futureOutlook
}: OutlookSectionProps) {
  return (
    <div className="space-y-6">
      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Analysis
          </CardTitle>
          <CardDescription>Performance trends and patterns over time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendAnalysis.trend_summary && (
            <Alert>
              <BarChart3 className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {trendAnalysis.trend_summary}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {/* Improving Metrics */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600">
                <TrendingUp className="h-4 w-4" />
                Improving
              </h4>
              <div className="space-y-1">
                {trendAnalysis.improving_metrics?.map((metric: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>{metric}</span>
                  </div>
                )) || <p className="text-sm text-muted-foreground">None</p>}
              </div>
            </div>

            {/* Declining Metrics */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-red-600">
                <TrendingDown className="h-4 w-4" />
                Declining
              </h4>
              <div className="space-y-1">
                {trendAnalysis.declining_metrics?.map((metric: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />
                    <span>{metric}</span>
                  </div>
                )) || <p className="text-sm text-muted-foreground">None</p>}
              </div>
            </div>

            {/* Stable Metrics */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-600">
                <Minus className="h-4 w-4" />
                Stable
              </h4>
              <div className="space-y-1">
                {trendAnalysis.stable_metrics?.map((metric: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Minus className="h-3 w-3 text-blue-600 flex-shrink-0" />
                    <span>{metric}</span>
                  </div>
                )) || <p className="text-sm text-muted-foreground">None</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
          <CardDescription>Identified risks and mitigation strategies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Risk Level */}
          {riskAssessment.overall_risk_level && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Overall Risk Level:</span>
              <Badge
                variant={
                  riskAssessment.overall_risk_level === 'low' ? 'default' :
                  riskAssessment.overall_risk_level === 'medium' ? 'secondary' :
                  'destructive'
                }
              >
                {riskAssessment.overall_risk_level.toUpperCase()}
              </Badge>
            </div>
          )}

          {/* Financial Risks */}
          {riskAssessment.financial_risks && riskAssessment.financial_risks.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                💰 Financial Risks
              </h4>
              <ul className="space-y-2">
                {riskAssessment.financial_risks.map((risk: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Operational Risks */}
          {riskAssessment.operational_risks && riskAssessment.operational_risks.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                ⚙️ Operational Risks
              </h4>
              <ul className="space-y-2">
                {riskAssessment.operational_risks.map((risk: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Market Risks */}
          {riskAssessment.market_risks && riskAssessment.market_risks.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                📊 Market Risks
              </h4>
              <ul className="space-y-2">
                {riskAssessment.market_risks.map((risk: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Mitigation Strategies */}
          {riskAssessment.risk_mitigation_strategies && riskAssessment.risk_mitigation_strategies.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600">
                <Target className="h-4 w-4" />
                Mitigation Strategies
              </h4>
              <ul className="space-y-2">
                {riskAssessment.risk_mitigation_strategies.map((strategy: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future Outlook - 3 Year Predictions */}
      {futureOutlook && futureOutlook.predictions_next_3_years && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              3-Year Financial Projections
            </CardTitle>
            <CardDescription>Predictive outlook based on historical trends and current performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Growth Trajectory */}
            {futureOutlook.growth_trajectory && (
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <strong>Growth Trajectory:</strong> {futureOutlook.growth_trajectory}
                </AlertDescription>
              </Alert>
            )}

            {/* Year Predictions */}
            <div className="grid gap-4 md:grid-cols-3">
              {['year_1', 'year_2', 'year_3'].map((yearKey, index) => {
                const yearData = futureOutlook.predictions_next_3_years[yearKey];
                if (!yearData) return null;

                return (
                  <Card key={yearKey} className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Year {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Revenue Projection */}
                      {yearData.revenue && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Revenue Projection</p>
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Expected:</span>
                              <span className="font-semibold">₹{(yearData.revenue.expected / 100000).toFixed(2)}L</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Range:</span>
                              <span>₹{(yearData.revenue.min / 100000).toFixed(2)}L - ₹{(yearData.revenue.max / 100000).toFixed(2)}L</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Net Profit Projection */}
                      {yearData.netProfit && (
                        <div className="space-y-1 border-t pt-2">
                          <p className="text-xs font-medium text-muted-foreground">Net Profit Projection</p>
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Expected:</span>
                              <span className="font-semibold text-green-600">₹{(yearData.netProfit.expected / 100000).toFixed(2)}L</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Range:</span>
                              <span>₹{(yearData.netProfit.min / 100000).toFixed(2)}L - ₹{(yearData.netProfit.max / 100000).toFixed(2)}L</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Key Metrics */}
                      {yearData.keyMetrics && (
                        <div className="space-y-1 border-t pt-2">
                          <p className="text-xs font-medium text-muted-foreground">Key Metrics</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {yearData.keyMetrics.currentRatio && (
                              <div>
                                <p className="text-muted-foreground">Current Ratio</p>
                                <p className="font-semibold">{yearData.keyMetrics.currentRatio}</p>
                              </div>
                            )}
                            {yearData.keyMetrics.netMargin && (
                              <div>
                                <p className="text-muted-foreground">Net Margin</p>
                                <p className="font-semibold">{yearData.keyMetrics.netMargin}</p>
                              </div>
                            )}
                            {yearData.keyMetrics.debtToEquity && (
                              <div className="col-span-2">
                                <p className="text-muted-foreground">Debt-to-Equity</p>
                                <p className="font-semibold">{yearData.keyMetrics.debtToEquity}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Opportunities and Challenges */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Major Opportunities */}
              {futureOutlook.major_opportunities && futureOutlook.major_opportunities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Major Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {futureOutlook.major_opportunities.map((opp: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 font-semibold flex-shrink-0">•</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Potential Challenges */}
              {futureOutlook.potential_challenges && futureOutlook.potential_challenges.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    Potential Challenges
                  </h4>
                  <ul className="space-y-2">
                    {futureOutlook.potential_challenges.map((challenge: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-600 font-semibold flex-shrink-0">•</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Immediate Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Immediate Actions
            </CardTitle>
            <CardDescription>Priority actions for next 3 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {healthAnalysis.immediate_recommendations?.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="font-semibold text-amber-600 flex-shrink-0">{index + 1}.</span>
                  <span>{rec}</span>
                </li>
              )) || <p className="text-sm text-muted-foreground">No immediate actions required</p>}
            </ul>
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Target className="h-5 w-5" />
              Strategic Plans
            </CardTitle>
            <CardDescription>Long-term strategic initiatives</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {healthAnalysis.strategic_recommendations?.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="font-semibold text-blue-600 flex-shrink-0">{index + 1}.</span>
                  <span>{rec}</span>
                </li>
              )) || <p className="text-sm text-muted-foreground">No strategic recommendations</p>}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Health Assessments */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Liquidity Assessment */}
        {healthAnalysis.liquidity_assessment && (
          <AssessmentCard
            title="Liquidity Assessment"
            icon="💧"
            status={healthAnalysis.liquidity_assessment.status}
            details={healthAnalysis.liquidity_assessment.details}
          />
        )}

        {/* Profitability Assessment */}
        {healthAnalysis.profitability_assessment && (
          <AssessmentCard
            title="Profitability Assessment"
            icon="💰"
            status={healthAnalysis.profitability_assessment.status}
            details={healthAnalysis.profitability_assessment.details}
          />
        )}

        {/* Leverage Assessment */}
        {healthAnalysis.leverage_assessment && (
          <AssessmentCard
            title="Leverage Assessment"
            icon="⚖️"
            status={healthAnalysis.leverage_assessment.status}
            details={healthAnalysis.leverage_assessment.details}
          />
        )}

        {/* Efficiency Assessment */}
        {healthAnalysis.efficiency_assessment && (
          <AssessmentCard
            title="Efficiency Assessment"
            icon="⚡"
            status={healthAnalysis.efficiency_assessment.status}
            details={healthAnalysis.efficiency_assessment.details}
          />
        )}

        {/* Growth Assessment */}
        {healthAnalysis.growth_assessment && (
          <AssessmentCard
            title="Growth Assessment"
            icon="📈"
            status={healthAnalysis.growth_assessment.status}
            details={healthAnalysis.growth_assessment.details}
          />
        )}
      </div>

      {/* Industry Benchmarking */}
      {industryBench && Object.keys(industryBench).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Industry Benchmarking
            </CardTitle>
            <CardDescription>Performance comparison with industry standards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(industryBench).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-sm text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AssessmentCard({ title, icon, status, details }: {
  title: string;
  icon: string;
  status: string;
  details: string;
}) {
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'good' || s === 'excellent' || s === 'strong') return 'text-green-600';
    if (s === 'fair' || s === 'moderate' || s === 'acceptable') return 'text-amber-600';
    if (s === 'poor' || s === 'weak') return 'text-red-600';
    return 'text-blue-600';
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    const s = status.toLowerCase();
    if (s === 'good' || s === 'excellent' || s === 'strong') return 'default';
    if (s === 'fair' || s === 'moderate' || s === 'acceptable') return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span>{icon}</span>
            {title}
          </CardTitle>
          <Badge variant={getStatusVariant(status)}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{details}</p>
      </CardContent>
    </Card>
  );
}

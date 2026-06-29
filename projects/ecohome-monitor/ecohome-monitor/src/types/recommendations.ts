/**
 * Optimization recommendation interface
 */
export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedSavings?: {
    percentage: string | number;
    monthlyKwh: string | number;
  };
  actions: string[];
  implementationDifficulty: 'low' | 'medium' | 'high';
  cost: string | number;
}
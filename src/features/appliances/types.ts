export type ApplianceCategory =
  | 'Cooling'
  | 'Kitchen'
  | 'Lighting'
  | 'Entertainment'
  | 'Laundry'
  | 'Workspace'
  | 'Others';

export interface Appliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  powerWatts: number;
  quantity: number;
  hoursPerDay: number;
  daysPerWeek: number;
  isActive: boolean;
}

export interface CalculationResult {
  dailyKwh: number;
  monthlyKwh: number;
  yearlyKwh: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
}

export interface ApplianceWithCost extends Appliance {
  dailyKwh: number;
  monthlyKwh: number;
  yearlyKwh: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  costPercentage: number;
}

export interface CategorySummary {
  category: ApplianceCategory;
  monthlyKwh: number;
  monthlyCost: number;
  costPercentage: number;
}

export interface BillSummary {
  totalDailyKwh: number;
  totalMonthlyKwh: number;
  totalYearlyKwh: number;
  totalDailyCost: number;
  totalMonthlyCost: number;
  totalYearlyCost: number;
}

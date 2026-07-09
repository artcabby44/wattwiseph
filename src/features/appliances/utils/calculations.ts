import type { Appliance, CalculationResult, ApplianceWithCost, CategorySummary, BillSummary, ApplianceCategory } from '../types';

/**
 * Calculates electricity consumption and cost for a single appliance
 */
export function calculateApplianceMetrics(appliance: Appliance, rateKwh: number): CalculationResult {
  if (!appliance.isActive) {
    return {
      dailyKwh: 0,
      monthlyKwh: 0,
      yearlyKwh: 0,
      dailyCost: 0,
      monthlyCost: 0,
      yearlyCost: 0,
    };
  }

  // Calculate average daily consumption, factoring in weekly frequency
  const dailyKwh = (appliance.powerWatts * appliance.quantity * appliance.hoursPerDay * (appliance.daysPerWeek / 7)) / 1000;
  
  // Standard monthly estimate based on 30 days
  const monthlyKwh = dailyKwh * 30;
  const yearlyKwh = dailyKwh * 365;

  return {
    dailyKwh,
    monthlyKwh,
    yearlyKwh,
    dailyCost: dailyKwh * rateKwh,
    monthlyCost: monthlyKwh * rateKwh,
    yearlyCost: yearlyKwh * rateKwh,
  };
}

/**
 * Generates the full summary of daily, monthly, and yearly consumption/cost for all appliances
 */
export function calculateBillSummary(appliances: Appliance[], rateKwh: number): BillSummary {
  let totalDailyKwh = 0;
  let totalMonthlyKwh = 0;
  let totalYearlyKwh = 0;
  let totalDailyCost = 0;
  let totalMonthlyCost = 0;
  let totalYearlyCost = 0;

  appliances.forEach((app) => {
    if (app.isActive) {
      const metrics = calculateApplianceMetrics(app, rateKwh);
      totalDailyKwh += metrics.dailyKwh;
      totalMonthlyKwh += metrics.monthlyKwh;
      totalYearlyKwh += metrics.yearlyKwh;
      totalDailyCost += metrics.dailyCost;
      totalMonthlyCost += metrics.monthlyCost;
      totalYearlyCost += metrics.yearlyCost;
    }
  });

  return {
    totalDailyKwh,
    totalMonthlyKwh,
    totalYearlyKwh,
    totalDailyCost,
    totalMonthlyCost,
    totalYearlyCost,
  };
}

/**
 * Enhances the appliance list with cost details and calculates individual percentages
 */
export function getApplianceCostList(appliances: Appliance[], rateKwh: number): ApplianceWithCost[] {
  const summary = calculateBillSummary(appliances, rateKwh);
  const totalCost = summary.totalMonthlyCost;

  return appliances.map((app) => {
    const metrics = calculateApplianceMetrics(app, rateKwh);
    const costPercentage = totalCost > 0 && app.isActive ? (metrics.monthlyCost / totalCost) * 100 : 0;

    return {
      ...app,
      ...metrics,
      costPercentage,
    };
  });
}

/**
 * Groups appliance costs by category and computes percentage contributions
 */
export function getCategorySummaries(appliances: Appliance[], rateKwh: number): CategorySummary[] {
  const costList = getApplianceCostList(appliances, rateKwh);
  const totalCost = calculateBillSummary(appliances, rateKwh).totalMonthlyCost;
  
  // Initialize summaries for each category
  const categories: ApplianceCategory[] = [
    'Cooling',
    'Kitchen',
    'Lighting',
    'Entertainment',
    'Laundry',
    'Workspace',
    'Others',
  ];

  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = {
      category: cat,
      monthlyKwh: 0,
      monthlyCost: 0,
      costPercentage: 0,
    };
    return acc;
  }, {} as Record<ApplianceCategory, CategorySummary>);

  // Accumulate costs
  costList.forEach((app) => {
    if (app.isActive) {
      grouped[app.category].monthlyKwh += app.monthlyKwh;
      grouped[app.category].monthlyCost += app.monthlyCost;
    }
  });

  // Calculate percentages
  categories.forEach((cat) => {
    if (totalCost > 0) {
      grouped[cat].costPercentage = (grouped[cat].monthlyCost / totalCost) * 100;
    }
  });

  return Object.values(grouped).filter(item => item.monthlyKwh > 0 || item.monthlyCost > 0);
}

import { useState, useEffect, useMemo } from 'react';
import type { Appliance } from '../types';
import { calculateBillSummary, getApplianceCostList, getCategorySummaries } from '../utils/calculations';

const DEFAULT_RATE = 11.50; // Average Meralco rate in PHP per kWh for 2026

const DEFAULT_APPLIANCES: Appliance[] = [];

export function useAppliances() {
  // Load initial state from LocalStorage or use defaults
  const [appliances, setAppliances] = useState<Appliance[]>(() => {
    try {
      const stored = localStorage.getItem('wattwise-appliances');
      return stored ? JSON.parse(stored) : DEFAULT_APPLIANCES;
    } catch (e) {
      console.error('Failed to load appliances from localStorage', e);
      return DEFAULT_APPLIANCES;
    }
  });

  const [rate, setRate] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('wattwise-rate');
      return stored ? parseFloat(stored) : DEFAULT_RATE;
    } catch (e) {
      console.error('Failed to load rate from localStorage', e);
      return DEFAULT_RATE;
    }
  });

  // Save changes to localStorage whenever appliances or rate updates
  useEffect(() => {
    try {
      localStorage.setItem('wattwise-appliances', JSON.stringify(appliances));
    } catch (e) {
      console.error('Failed to save appliances to localStorage', e);
    }
  }, [appliances]);

  useEffect(() => {
    try {
      localStorage.setItem('wattwise-rate', rate.toString());
    } catch (e) {
      console.error('Failed to save rate to localStorage', e);
    }
  }, [rate]);

  // Operations
  const addAppliance = (newApp: Omit<Appliance, 'id'>) => {
    const id = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setAppliances((prev) => [...prev, { ...newApp, id }]);
  };

  const updateAppliance = (id: string, updatedFields: Partial<Appliance>) => {
    setAppliances((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updatedFields } : app))
    );
  };

  const deleteAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((app) => app.id !== id));
  };

  const toggleApplianceActive = (id: string) => {
    setAppliances((prev) =>
      prev.map((app) => (app.id === id ? { ...app, isActive: !app.isActive } : app))
    );
  };

  const duplicateAppliance = (id: string) => {
    const target = appliances.find((app) => app.id === id);
    if (!target) return;
    const duplicated: Appliance = {
      ...target,
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${target.name} (Copy)`,
    };
    setAppliances((prev) => [...prev, duplicated]);
  };

  const resetToDefault = () => {
    setAppliances(DEFAULT_APPLIANCES);
    setRate(DEFAULT_RATE);
  };

  const clearAll = () => {
    setAppliances([]);
  };

  // Derived memoized computations
  const billSummary = useMemo(() => calculateBillSummary(appliances, rate), [appliances, rate]);
  const applianceCosts = useMemo(() => getApplianceCostList(appliances, rate), [appliances, rate]);
  const categoryCosts = useMemo(() => getCategorySummaries(appliances, rate), [appliances, rate]);

  return {
    appliances,
    rate,
    setRate,
    addAppliance,
    updateAppliance,
    deleteAppliance,
    toggleApplianceActive,
    duplicateAppliance,
    resetToDefault,
    clearAll,
    billSummary,
    applianceCosts,
    categoryCosts,
  };
}

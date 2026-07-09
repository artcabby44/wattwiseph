import { useMemo, useState, useEffect } from 'react';
import { Lightbulb, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { ApplianceWithCost } from '../types';
import { MascotOwl } from '../../../components/MascotOwl';

interface MascotTipsProps {
  applianceCosts: ApplianceWithCost[];
  totalMonthlyCost: number;
}

interface EnergyTip {
  id: string;
  title: string;
  description: string;
  savingsEstimate: string;
}

export function MascotTips({ applianceCosts, totalMonthlyCost }: MascotTipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips: EnergyTip[] = useMemo(() => {
    const list: EnergyTip[] = [];
    const activeApps = applianceCosts.filter((a) => a.isActive);

    if (activeApps.length === 0) {
      return [
        {
          id: 'welcome',
          title: 'Hoot! Let\'s get started!',
          description: 'Add your household appliances using the form to analyze your energy usage. I\'ll give you wise savings tips here!',
          savingsEstimate: 'Up to 30% savings',
        },
      ];
    }

    // Find the highest consumer
    const sortedActive = [...activeApps].sort((a, b) => b.monthlyCost - a.monthlyCost);
    const topConsumer = sortedActive[0];

    // 1. Customized top consumer tip
    if (topConsumer && topConsumer.monthlyCost > 200) {
      const pct = ((topConsumer.monthlyCost / totalMonthlyCost) * 100).toFixed(0);
      list.push({
        id: 'top-consumer',
        title: `Manage your ${topConsumer.name}!`,
        description: `Your ${topConsumer.name} is your highest electricity consumer, costing ₱${Math.round(
          topConsumer.monthlyCost
        )} per month (${pct}% of your bill). Reducing its daily use by just 1 hour could save you around ₱${Math.round(
          (topConsumer.monthlyCost / topConsumer.hoursPerDay)
        )} monthly.`,
        savingsEstimate: `₱${Math.round(topConsumer.monthlyCost / topConsumer.hoursPerDay)} / month`,
      });
    }

    // 2. Aircon / Cooling specific tip
    const coolingApps = activeApps.filter((a) => a.category === 'Cooling');
    const totalCoolingCost = coolingApps.reduce((sum, a) => sum + a.monthlyCost, 0);

    if (totalCoolingCost > 500) {
      const hasNonInverter = coolingApps.some((a) => a.name.toLowerCase().includes('non-inverter'));
      list.push({
        id: 'aircon-thermostat',
        title: 'Wise Aircon Settings',
        description: 'Set your air conditioner thermostat to 25°C instead of 18°C. For every degree higher you set it, you save up to 7% to 10% on your aircon\'s energy consumption.',
        savingsEstimate: 'Save up to 10% per degree',
      });

      if (hasNonInverter) {
        list.push({
          id: 'inverter-upgrade',
          title: 'Go Inverter!',
          description: 'I noticed you have non-inverter cooling units active. Upgrading to Inverter units can cut their electricity consumption by 30% to 50%!',
          savingsEstimate: '30% - 50% lower cooling cost',
        });
      }
    }

    // 3. Phantom Load / Standby tip
    const standbyCategories = activeApps.filter(
      (a) => a.category === 'Entertainment' || a.category === 'Workspace'
    );
    if (standbyCategories.length > 0) {
      list.push({
        id: 'phantom-load',
        title: 'Slay the Vampire Loads',
        description: 'Appliances like TVs, computers, game consoles, and chargers consume power even when turned off but plugged in. Unplug them or use a smart power strip to switch them off.',
        savingsEstimate: 'Save ₱50 - ₱150 per month',
      });
    }

    // 4. Fridge specific tip
    const hasFridge = activeApps.some((a) => a.category === 'Kitchen' && a.name.toLowerCase().includes('ref'));
    if (hasFridge) {
      list.push({
        id: 'fridge-efficiency',
        title: 'Optimize Refrigerator Cooling',
        description: 'Keep your refrigerator door gaskets clean and sealed. Try to keep the freezer 2/3 full, and leave some space for air circulation. Avoid placing hot food directly inside.',
        savingsEstimate: 'Save 5% to 10% on fridge cost',
      });
    }

    // 5. Lighting tip
    const lightingApps = activeApps.filter((a) => a.category === 'Lighting');
    if (lightingApps.length > 0) {
      const hasLED = lightingApps.some((a) => a.name.toLowerCase().includes('led'));
      list.push({
        id: 'led-lighting',
        title: 'Bright LED Savings',
        description: hasLED
          ? 'Great job using LED bulbs! Remember to turn off lights when leaving a room to squeeze out extra savings.'
          : 'Consider replacing traditional bulbs with LED bulbs. LEDs use up to 80% less energy and last up to 10 times longer.',
        savingsEstimate: 'Up to 80% lighting energy saved',
      });
    }

    // 6. Laundry / Washing tip
    const laundryApps = activeApps.filter((a) => a.category === 'Laundry');
    if (laundryApps.length > 0) {
      list.push({
        id: 'laundry-tips',
        title: 'Efficient Washing & Ironing',
        description: 'Wash full loads of clothes using cold water settings to save energy. Iron clothes in one big batch rather than daily to avoid repeatedly heating up the iron.',
        savingsEstimate: 'Save up to ₱100 / month',
      });
    }

    // 7. General baseline tip
    list.push({
      id: 'general-ph',
      title: 'Meralco Peak Hours Warning',
      description: 'Electricity rates can occasionally spike. Minimize running high-power appliances (AC, washing machine, iron) during peak hours, typically weekdays from 1:00 PM to 4:00 PM.',
      savingsEstimate: 'Peak Load Management',
    });

    return list;
  }, [applianceCosts, totalMonthlyCost]);

  // Adjust tip index if list shrinks
  useEffect(() => {
    if (currentTipIndex >= tips.length) {
      setCurrentTipIndex(0);
    }
  }, [tips, currentTipIndex]);

  const activeTip = tips[currentTipIndex] || tips[0];

  const handleNext = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const handlePrev = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  // Determine owl mood based on bill
  const owlMood = useMemo(() => {
    if (applianceCosts.filter((a) => a.isActive).length === 0) return 'neutral';
    if (totalMonthlyCost > 5000) return 'worried';
    if (totalMonthlyCost < 1200) return 'happy';
    return 'neutral';
  }, [applianceCosts, totalMonthlyCost]);

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-500/20 dark:border-emerald-900/30 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center gap-6 transition-all duration-300">
      {/* Mascot Owl left */}
      <div className="shrink-0 flex flex-col items-center">
        <MascotOwl mood={owlMood} />
        <div className="mt-2 text-center">
          <span className="font-display font-extrabold text-sm text-emerald-800 dark:text-emerald-400">
            Watt the Owl
          </span>
          <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 font-semibold uppercase tracking-wider">
            {owlMood === 'worried' ? 'Concerned' : owlMood === 'happy' ? 'Cheerful' : 'Wise Helper'}
          </p>
        </div>
      </div>

      {/* Tip Bubble right */}
      <div className="flex-1 w-full flex flex-col justify-between min-h-[140px]">
        <div>
          {/* Bubble Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/20 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 p-1.5 rounded-lg">
              <Lightbulb className="w-4 h-4" />
            </span>
            <span className="font-display font-extrabold text-sm text-emerald-800 dark:text-emerald-400">
              Watt's Wisdom
            </span>
            <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-bold">
              Tip {currentTipIndex + 1} of {tips.length}
            </span>
          </div>

          {/* Tip Title */}
          <h4 className="font-display font-bold text-base text-slate-805 dark:text-slate-100 mb-1.5 flex items-center gap-1.5">
            {activeTip.title}
          </h4>

          {/* Tip Content */}
          <p className="text-xs md:text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
            {activeTip.description}
          </p>
        </div>

        {/* Tip Footer Controls */}
        <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between gap-4">
          <div className="bg-emerald-500/15 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-500/10">
            <span className="text-[10px] font-bold text-emerald-750 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Est. Savings: {activeTip.savingsEstimate}
            </span>
          </div>

          {tips.length > 1 && (
            <div className="flex items-center gap-1 no-print">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-slate-205 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                title="Previous tip"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-slate-205 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                title="Next tip"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

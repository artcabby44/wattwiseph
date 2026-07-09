import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sparkles, Plus } from 'lucide-react';
import type { Appliance, ApplianceCategory } from '../types';

const CATEGORIES: ApplianceCategory[] = [
  'Cooling',
  'Kitchen',
  'Lighting',
  'Entertainment',
  'Laundry',
  'Workspace',
  'Others',
];

const PRESETS = [
  { name: 'Inverter Aircon (1.0 HP)', category: 'Cooling', powerWatts: 850, hoursPerDay: 8, daysPerWeek: 7 },
  { name: 'Non-Inverter Aircon (1.0 HP)', category: 'Cooling', powerWatts: 1000, hoursPerDay: 8, daysPerWeek: 7 },
  { name: 'Refrigerator (Two-Door)', category: 'Kitchen', powerWatts: 150, hoursPerDay: 24, daysPerWeek: 7 },
  { name: 'Stand Fan (16")', category: 'Cooling', powerWatts: 55, hoursPerDay: 12, daysPerWeek: 7 },
  { name: 'Smart LED TV (43")', category: 'Entertainment', powerWatts: 75, hoursPerDay: 5, daysPerWeek: 7 },
  { name: 'LED Bulb (9W)', category: 'Lighting', powerWatts: 9, hoursPerDay: 6, daysPerWeek: 7 },
  { name: 'Induction Cooker', category: 'Kitchen', powerWatts: 1800, hoursPerDay: 1.5, daysPerWeek: 7 },
  { name: 'Microwave Oven', category: 'Kitchen', powerWatts: 1200, hoursPerDay: 0.3, daysPerWeek: 7 },
  { name: 'Electric Kettle', category: 'Kitchen', powerWatts: 1500, hoursPerDay: 0.2, daysPerWeek: 7 },
  { name: 'Washing Machine (Front)', category: 'Laundry', powerWatts: 450, hoursPerDay: 2, daysPerWeek: 3 },
  { name: 'Laptop (Office)', category: 'Workspace', powerWatts: 60, hoursPerDay: 8, daysPerWeek: 5 },
  { name: 'Desktop PC (Gaming)', category: 'Workspace', powerWatts: 350, hoursPerDay: 4, daysPerWeek: 7 },
  { name: 'Flat Iron', category: 'Laundry', powerWatts: 1000, hoursPerDay: 2, daysPerWeek: 1 },
];

const applianceSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  category: z.enum(['Cooling', 'Kitchen', 'Lighting', 'Entertainment', 'Laundry', 'Workspace', 'Others'] as const),
  powerWatts: z.number({ message: 'Power is required' })
    .positive({ message: 'Power rating must be greater than 0' })
    .max(15000, { message: 'Max power limit is 15kW' }),
  quantity: z.number({ message: 'Quantity is required' })
    .int()
    .positive({ message: 'Quantity must be at least 1' })
    .max(100, { message: 'Max quantity is 100' }),
  hoursPerDay: z.number({ message: 'Hours is required' })
    .min(0.01, { message: 'Hours must be greater than 0' })
    .max(24, { message: 'Hours cannot exceed 24 per day' }),
  daysPerWeek: z.number({ message: 'Days is required' })
    .int()
    .min(1, { message: 'Days must be at least 1' })
    .max(7, { message: 'Days cannot exceed 7 per week' }),
});

type ApplianceFormValues = z.infer<typeof applianceSchema>;

interface ApplianceFormProps {
  onAddAppliance: (appliance: Omit<Appliance, 'id'>) => void;
  editingAppliance?: Appliance | null;
  onUpdateAppliance?: (id: string, fields: Partial<Appliance>) => void;
  onCancelEdit?: () => void;
}

export function ApplianceForm({
  onAddAppliance,
  editingAppliance = null,
  onUpdateAppliance,
  onCancelEdit,
}: ApplianceFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplianceFormValues>({
    resolver: zodResolver(applianceSchema),
    defaultValues: {
      name: '',
      category: 'Others',
      powerWatts: 100,
      quantity: 1,
      hoursPerDay: 4,
      daysPerWeek: 7,
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (editingAppliance) {
      reset({
        name: editingAppliance.name,
        category: editingAppliance.category,
        powerWatts: editingAppliance.powerWatts,
        quantity: editingAppliance.quantity,
        hoursPerDay: editingAppliance.hoursPerDay,
        daysPerWeek: editingAppliance.daysPerWeek,
      });
    } else {
      reset({
        name: '',
        category: 'Others',
        powerWatts: 100,
        quantity: 1,
        hoursPerDay: 4,
        daysPerWeek: 7,
      });
    }
  }, [editingAppliance, reset]);

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setValue('name', preset.name, { shouldValidate: true });
    setValue('category', preset.category as ApplianceCategory, { shouldValidate: true });
    setValue('powerWatts', preset.powerWatts, { shouldValidate: true });
    setValue('hoursPerDay', preset.hoursPerDay, { shouldValidate: true });
    setValue('daysPerWeek', preset.daysPerWeek, { shouldValidate: true });
  };

  const onSubmit = (data: ApplianceFormValues) => {
    if (editingAppliance && onUpdateAppliance) {
      onUpdateAppliance(editingAppliance.id, data);
      if (onCancelEdit) onCancelEdit();
    } else {
      onAddAppliance({
        ...data,
        isActive: true,
      });
      reset();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">
          {editingAppliance ? '✏️ Edit Appliance' : '🔌 Add Appliance'}
        </h2>
        {editingAppliance && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-semibold px-3 py-1 bg-slate-100 hover:bg-slate-202 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 rounded-md transition-colors"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Presets - Only show when NOT editing for cleaner layout */}
      {!editingAppliance && (
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Presets (Philippine Averages)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-850">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-xs bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-655 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-350 font-medium transition-all shadow-2xs hover:scale-102"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Appliance Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Master Bedroom Inverter AC"
            {...register('name')}
            className={`w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 ${
              errors.name
                ? 'border-red-400 dark:border-red-650 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-600'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-555 dark:text-red-400 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Category & Power */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              id="category"
              {...register('category')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-600"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="powerWatts" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Power Rating (Watts)
            </label>
            <div className="relative">
              <input
                id="powerWatts"
                type="number"
                step="any"
                placeholder="100"
                {...register('powerWatts', { valueAsNumber: true })}
                className={`w-full pl-3.5 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 ${
                  errors.powerWatts
                    ? 'border-red-400 dark:border-red-650 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-600'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-405">
                W
              </span>
            </div>
            {errors.powerWatts && (
              <p className="mt-1 text-xs text-red-555 dark:text-red-400 font-medium">{errors.powerWatts.message}</p>
            )}
          </div>
        </div>

        {/* Quantity, Hours, Days */}
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label htmlFor="quantity" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              {...register('quantity', { valueAsNumber: true })}
              className={`w-full px-2.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                errors.quantity
                  ? 'border-red-400 dark:border-red-650 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-600'
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-[10px] text-red-555 dark:text-red-400 font-medium leading-tight">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="hoursPerDay" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Hours / Day
            </label>
            <input
              id="hoursPerDay"
              type="number"
              step="any"
              min="0"
              max="24"
              {...register('hoursPerDay', { valueAsNumber: true })}
              className={`w-full px-2.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                errors.hoursPerDay
                  ? 'border-red-400 dark:border-red-650 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-600'
              }`}
            />
            {errors.hoursPerDay && (
              <p className="mt-1 text-[10px] text-red-555 dark:text-red-400 font-medium leading-tight">{errors.hoursPerDay.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="daysPerWeek" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Days / Week
            </label>
            <input
              id="daysPerWeek"
              type="number"
              min="1"
              max="7"
              {...register('daysPerWeek', { valueAsNumber: true })}
              className={`w-full px-2.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                errors.daysPerWeek
                  ? 'border-red-400 dark:border-red-650 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-600'
              }`}
            />
            {errors.daysPerWeek && (
              <p className="mt-1 text-[10px] text-red-555 dark:text-red-400 font-medium leading-tight">{errors.daysPerWeek.message}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-1.5 bg-emerald-650 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs hover:shadow-xs active:scale-98 transition-all cursor-pointer mt-2"
        >
          {editingAppliance ? (
            <>Save Changes</>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add to Calculator
            </>
          )}
        </button>
      </form>
    </div>
  );
}

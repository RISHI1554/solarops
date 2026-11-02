import React, { useState } from 'react';
import { SolarPackage } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Save, Sun, Plus } from 'lucide-react';

interface PackageManagerModalProps {
  packageToEdit?: SolarPackage | null;
  onClose: () => void;
}

export const PackageManagerModal: React.FC<PackageManagerModalProps> = ({
  packageToEdit,
  onClose,
}) => {
  const { createPackage, updatePackage } = useApp();

  const [name, setName] = useState(packageToEdit?.name || '');
  const [capacityKw, setCapacityKw] = useState(packageToEdit?.capacity_kw || 3.0);
  const [panelCount, setPanelCount] = useState(packageToEdit?.panel_count || 8);
  const [panelType, setPanelType] = useState(packageToEdit?.panel_type || '550W TopCon Bifacial N-Type');
  const [inverterType, setInverterType] = useState(packageToEdit?.inverter_type || '3.3kW Dual MPPT Smart Inverter with WiFi');
  const [priceInr, setPriceInr] = useState(packageToEdit?.price_inr || 185000);
  const [description, setDescription] = useState(packageToEdit?.description || '');
  const [warrantyYears, setWarrantyYears] = useState(packageToEdit?.warranty_years || 25);
  const [roofAreaSqft, setRoofAreaSqft] = useState(packageToEdit?.roof_area_sqft || 270);
  const [monthlyGenUnits, setMonthlyGenUnits] = useState(packageToEdit?.monthly_gen_units || 360);
  const [isActive, setIsActive] = useState(packageToEdit ? packageToEdit.is_active : true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (packageToEdit) {
      await updatePackage(packageToEdit.id, {
        name,
        capacity_kw: Number(capacityKw),
        panel_count: Number(panelCount),
        panel_type: panelType,
        inverter_type: inverterType,
        price_inr: Number(priceInr),
        description,
        warranty_years: Number(warrantyYears),
        roof_area_sqft: Number(roofAreaSqft),
        monthly_gen_units: Number(monthlyGenUnits),
        is_active: isActive,
      });
    } else {
      await createPackage({
        name,
        capacity_kw: Number(capacityKw),
        panel_count: Number(panelCount),
        panel_type: panelType,
        inverter_type: inverterType,
        price_inr: Number(priceInr),
        description,
        warranty_years: Number(warrantyYears),
        roof_area_sqft: Number(roofAreaSqft),
        monthly_gen_units: Number(monthlyGenUnits),
        is_active: isActive,
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              {packageToEdit ? 'Edit Solar Package' : 'Create New Solar Package'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Package Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 3 kW Standard Residence System"
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Capacity (kW) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={capacityKw}
                onChange={e => setCapacityKw(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Price in INR (₹) *</label>
              <input
                type="number"
                step="1000"
                required
                value={priceInr}
                onChange={e => setPriceInr(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Panel Count</label>
              <input
                type="number"
                value={panelCount}
                onChange={e => setPanelCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Panel Type</label>
              <input
                type="text"
                value={panelType}
                onChange={e => setPanelType(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Inverter Model</label>
            <input
              type="text"
              value={inverterType}
              onChange={e => setInverterType(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Roof Space (sq.ft)</label>
              <input
                type="number"
                value={roofAreaSqft}
                onChange={e => setRoofAreaSqft(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Monthly Gen (units)</label>
              <input
                type="number"
                value={monthlyGenUnits}
                onChange={e => setMonthlyGenUnits(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Warranty (Years)</label>
              <input
                type="number"
                value={warrantyYears}
                onChange={e => setWarrantyYears(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Package Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 border border-stone-300 rounded-xl bg-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="is_active" className="text-xs font-semibold text-stone-700 cursor-pointer">
              Active package (visible to customers on the landing page & booking modal)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Package'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

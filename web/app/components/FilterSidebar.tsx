import { SlidersHorizontal } from "lucide-react";

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow";

export default function FilterSidebar({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <form className="flex flex-col gap-4 w-full sm:w-64 bg-white border border-slate-200 rounded-xl p-5 h-fit">
      <div className="flex items-center gap-2 text-slate-900 font-semibold">
        <SlidersHorizontal size={16} />
        Filters
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Make</label>
        <input
          type="text"
          name="make"
          placeholder="e.g. Ford"
          defaultValue={searchParams.make ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Max price (£)</label>
        <input
          type="number"
          name="price_max"
          placeholder="15000"
          defaultValue={searchParams.price_max ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Min year</label>
        <input
          type="number"
          name="year_min"
          placeholder="2018"
          defaultValue={searchParams.year_min ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Fuel type</label>
        <select name="fuel_type" defaultValue={searchParams.fuel_type ?? ""} className={inputClass}>
          <option value="">Any fuel</option>
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="hybrid">Hybrid</option>
          <option value="electric">Electric</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Body type</label>
        <select name="body_type" defaultValue={searchParams.body_type ?? ""} className={inputClass}>
          <option value="">Any body type</option>
          <option value="hatchback">Hatchback</option>
          <option value="estate">Estate</option>
          <option value="saloon">Saloon</option>
          <option value="suv">SUV</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-brand hover:bg-brand-dark text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
      >
        Apply filters
      </button>
    </form>
  );
}

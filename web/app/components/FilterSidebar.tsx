export default function FilterSidebar({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <form className="flex flex-col gap-3 w-56">
      <input
        type="text"
        name="make"
        placeholder="Make"
        defaultValue={searchParams.make ?? ""}
        className="border rounded px-2 py-1"
      />
      <input
        type="number"
        name="price_max"
        placeholder="Max price (£)"
        defaultValue={searchParams.price_max ?? ""}
        className="border rounded px-2 py-1"
      />
      <input
        type="number"
        name="year_min"
        placeholder="Min year"
        defaultValue={searchParams.year_min ?? ""}
        className="border rounded px-2 py-1"
      />
      <select name="fuel_type" defaultValue={searchParams.fuel_type ?? ""} className="border rounded px-2 py-1">
        <option value="">Any fuel</option>
        <option value="petrol">Petrol</option>
        <option value="diesel">Diesel</option>
        <option value="hybrid">Hybrid</option>
        <option value="electric">Electric</option>
      </select>
      <select name="body_type" defaultValue={searchParams.body_type ?? ""} className="border rounded px-2 py-1">
        <option value="">Any body type</option>
        <option value="hatchback">Hatchback</option>
        <option value="estate">Estate</option>
        <option value="saloon">Saloon</option>
        <option value="suv">SUV</option>
      </select>
      <button type="submit" className="bg-black text-white rounded px-3 py-2">
        Apply filters
      </button>
    </form>
  );
}

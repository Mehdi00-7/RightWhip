import Link from "next/link";
import { Car, MapPin, Sparkles, ShieldCheck } from "lucide-react";
import NLSearchBar from "@/app/components/NLSearchBar";

const bodyTypes = [
  { label: "Hatchback", value: "hatchback" },
  { label: "Estate", value: "estate" },
  { label: "SUV", value: "suv" },
  { label: "Saloon", value: "saloon" },
];

const features = [
  {
    icon: Sparkles,
    title: "Search in plain English",
    body: "Type what you want — \"reliable family car under £15k, automatic\" — and we'll turn it into real filters.",
  },
  {
    icon: ShieldCheck,
    title: "Know if the price is fair",
    body: "Every listing is checked against similar cars nearby, so you know if it's priced above or below market.",
  },
  {
    icon: MapPin,
    title: "Find cars near you",
    body: "Browse on a map and search by radius from your location.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <section className="bg-gradient-to-b from-blue-50 to-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-medium text-slate-600 mb-6">
            <Car size={14} className="text-brand" />
            Used cars, found simply
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Find your next car
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Search hundreds of listings by typing what you&apos;re after, or browse and filter manually.
          </p>

          <NLSearchBar />

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {bodyTypes.map((bt) => (
              <Link
                key={bt.value}
                href={`/listings?body_type=${bt.value}`}
                className="text-sm bg-white border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 hover:border-brand hover:text-brand transition-colors"
              >
                {bt.label}
              </Link>
            ))}
          </div>

          <Link
            href="/listings"
            className="inline-block mt-8 bg-brand hover:bg-brand-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Browse all listings
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="bg-blue-50 text-brand rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";

const CATEGORIES = [
  { name: "Live Birds", slug: "live-birds", icon: "🐔" },
  { name: "Eggs", slug: "eggs", icon: "🥚" },
  { name: "Day-Old Chicks", slug: "day-old-chicks", icon: "🐣" },
  { name: "Feed", slug: "feed", icon: "🌾" },
  { name: "Drugs", slug: "drugs", icon: "💊" },
  { name: "Equipment", slug: "equipment", icon: "🧰" },
  { name: "Manure", slug: "manure", icon: "🪣" },
];

export function Categories() {
  return (
    <section className="py-16 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
      <h2 className="font-head font-extrabold text-3xl md:text-4xl text-center mb-10">Shop by category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/marketplace?category=${c.slug}`}
            className="group bg-background border-2 border-foreground rounded-2xl p-4 flex flex-col items-center gap-2 pixel-shadow hover:-translate-y-1 hover:bg-foreground hover:text-background transition"
          >
            <span className="text-3xl">{c.icon}</span>
            <span className="text-xs font-bold text-center">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
const ROLES = ["Farmers", "Buyers", "Suppliers", "Transporters", "Veterinarians", "Cooperatives", "Financiers & Insurers"];

export function Ecosystem() {
  return (
    <section className="py-16 px-6 max-w-5xl mx-auto text-center">
      <h2 className="font-head font-extrabold text-3xl md:text-4xl mb-3">One connected ecosystem</h2>
      <p className="text-muted-foreground mb-10">PoultryLink links every participant in the poultry value chain.</p>
      <div className="flex flex-wrap justify-center gap-3">
        {ROLES.map((r) => (
          <span key={r} className="bg-card border border-foreground/15 rounded-full px-4 py-2 text-sm font-bold pixel-shadow">
            {r}
          </span>
        ))}
      </div>
    </section>
  );
}
const STEPS = [
  "Find a listing",
  "Place an order",
  "Secure payment",
  "Delivery",
  "Confirm delivery",
  "Seller paid",
  "Rate it",
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
      <h2 className="font-head font-extrabold text-3xl md:text-4xl text-center mb-10">How an order flows</h2>
      <div className="flex flex-wrap justify-center gap-y-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center w-28">
              <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-head font-bold">
                {i + 1}
              </div>
              <p className="text-xs font-semibold text-center mt-2">{s}</p>
            </div>
            {i < STEPS.length - 1 && <div className="link-dash w-8 md:w-10 mx-1 mt-[-20px]" />}
          </div>
        ))}
      </div>
    </section>
  );
}
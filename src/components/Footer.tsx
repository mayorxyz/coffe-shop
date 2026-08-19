export default function Footer() {
  return (
    <footer className="border-t border-char bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-4 py-8 sm:px-6">
        <p className="text-sm text-smoke">
          <span className="font-display font-semibold text-parchment/90">Roast &amp; Row</span>
          {" — "}small-batch coffee, logged to the degree since 2019.
        </p>
        <p className="text-xs text-smoke/80">
          A fictional roastery. Built with React, Vite &amp; Tailwind — no beans were harmed, no payments are taken.
        </p>
      </div>
    </footer>
  );
}

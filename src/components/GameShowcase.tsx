const games = [
  {
    name: "Free Fire MAX",
    subtitle: "Battle Royale",
    imageClass: "arena-game-freefire",
    href: "/tournaments?game=freefire",
  },
  {
    name: "BGMI",
    subtitle: "Survival Battle",
    imageClass: "arena-game-bgmi",
    href: "/tournaments?game=bgmi",
  },
  {
    name: "Valorant",
    subtitle: "Tactical 5v5",
    imageClass: "arena-game-valorant",
    href: "/tournaments?game=valorant",
  },
];

export default function GameShowcase() {
  return (
    <section className="relative z-10 mt-10">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
          Choose your battlefield
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Explore Games
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game, index) => (
          <a
            key={game.name}
            href={game.href}
            className={`arena-game-card ${game.imageClass} arena-animate`}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="arena-badge">{game.subtitle}</span>
              <h3 className="mt-3 text-2xl font-extrabold text-white">
                {game.name}
              </h3>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-200">
                Explore tournaments <span aria-hidden="true">→</span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
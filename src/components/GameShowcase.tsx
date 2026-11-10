
import Image from "next/image";

const games = [
  {
    name: 'Free Fire MAX',
    subtitle: 'Battle Royale',
    imageClass: 'arena-game-freefire',
    imageSrc: '/games/freefire.jpg',
    href: '/?game=free-fire-max#tournaments',
  },
  {
    name: 'BGMI',
    subtitle: 'Survival Battle',
    imageClass: 'arena-game-bgmi',
    imageSrc: '/games/bgmi.jpg',
    href: '/?game=bgmi#tournaments',
  },
  {
    name: 'Valorant',
    subtitle: 'Tactical 5v5',
    imageClass: 'arena-game-valorant',
    imageSrc: '/games/valorant.jpg',
    href: '/?game=valorant#tournaments',
  },
];

export default function GameShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <span className="arena-badge">Choose your battlefield</span>
        <h2 className="mt-4 text-3xl font-black sm:text-4xl">
          Explore Games
        </h2>
        <p className="mt-3 text-white/60">
          Find your game. Join your tournament. Become a champion.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game, index) => (
          <a
            key={game.name}
            href={game.href}
            className={`arena-game-card ${game.imageClass} arena-animate group`}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <Image
              src={game.imageSrc}
              alt=""
              fill
              quality={75}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="arena-game-image"
            />
            <div className="relative z-10 flex h-full min-h-[260px] flex-col justify-end p-6">
              <span className="arena-badge w-fit">{game.subtitle}</span>

              <h3 className="mt-3 text-2xl font-black text-white">
                {game.name}
              </h3>

              <p className="mt-2 font-semibold text-white/80 transition group-hover:text-white">
                Explore tournaments →
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";

const games = [
  {name:"Free Fire MAX",subtitle:"BATTLE ROYALE",tag:"01 / MAIN STAGE",imageSrc:"/games/freefire.jpg",href:"/?game=free-fire-max#tournaments",featured:true},
  {name:"BGMI",subtitle:"SURVIVAL BATTLE",tag:"02 / SQUAD",imageSrc:"/games/bgmi.jpg",href:"/?game=bgmi#tournaments"},
  {name:"Valorant",subtitle:"TACTICAL 5V5",tag:"03 / TACTICAL",imageSrc:"/games/valorant.jpg",href:"/?game=valorant#tournaments"},
];

export default function GameShowcase() {
  return (
    <section className="arena-games-section mt-10 sm:mt-14">
      <div className="arena-section-heading mb-5 sm:mb-7">
        <div>
          <p className="arena-eyebrow">SELECT YOUR MODE</p>
          <h2>Choose your <span>battlefield.</span></h2>
          <p>Three games. Three ways to make your mark.</p>
        </div>
        <span className="arena-section-index">GAMES / 03</span>
      </div>
      <div className="arena-games-grid">
        {games.map((game) => (
          <a key={game.name} href={game.href} className={`arena-game-tile ${game.featured ? "arena-game-featured" : ""}`}>
            <Image src={game.imageSrc} alt="" fill quality={70} loading="lazy" sizes={game.featured ? "(max-width: 768px) 100vw, 58vw" : "(max-width: 768px) 100vw, 42vw"} className="arena-game-tile-art" />
            <div className="arena-game-tile-shade" />
            <div className="arena-game-tile-content">
              <span className="arena-game-tag">{game.tag}</span>
              <div>
                <p className="arena-game-subtitle">{game.subtitle}</p>
                <h3>{game.name}</h3>
                <span className="arena-game-enter">VIEW TOURNAMENTS <b>↗</b></span>
              </div>
            </div>
            <span className="arena-game-tile-corner" aria-hidden="true">+</span>
          </a>
        ))}
      </div>
    </section>
  );
}

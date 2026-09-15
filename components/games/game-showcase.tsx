import { ArrowUpRight, Gamepad2 } from "lucide-react";
import { LightboxImage } from "@/components/ui/lightbox-image";

const ASSET_PREFIX = process.env.NODE_ENV === "production" ? "/hhx-resume-site" : "";

const GAMES = [
  {
    title: "星际防线",
    en: "Star Defense · Plane Battle",
    description: "三关制弹幕战斗小游戏，包含无尽模式、强化升级与排行榜。",
    image: "/games/star-defense.png",
    href: "https://hhy077.github.io/polyglot/game/",
  },
  {
    title: "电脑打字游戏",
    en: "Keybreak Typing Arena",
    description: "以节奏、准确率和连续输入为核心的中英文字词训练游戏。",
    image: "/games/keybreak-typing-arena.png",
    href: "https://hhy077.github.io/keybreak-typing-arena/",
  },
  {
    title: "沉浸式多语种学习",
    en: "PolyGlot Language Learning",
    description: "覆盖英语、日语和韩语的沉浸式学习平台，包含课程、练习与进度追踪。",
    image: "/games/polyglot.png",
    href: "https://hhy077.github.io/polyglot/",
  },
  {
    title: "十日终焉",
    en: "Ten Days · Text MUD",
    description: "以自由输入、推理和轮回叙事为核心的沉浸式文字 MUD 网页游戏。",
    image: "/games/ten-days-mud.png",
    href: "https://hhy077.github.io/ten-days/",
  },
] as const;

export function GameShowcase() {
  return (
    <section className="game-showcase-section" id="games">
      <div className="section-kicker">03 / GAME SHOWCASE</div>
      <div className="game-showcase-heading">
        <div>
          <h2>制作游戏展示<br /><em>Game Showcase</em></h2>
          <p>从互动学习到文字冒险，记录我制作并持续迭代的游戏与体验项目。</p>
        </div>
        <div className="game-showcase-badge"><Gamepad2 className="h-5 w-5" aria-hidden="true" /><span>4 playable experiences</span></div>
      </div>
      <div className="game-grid">
        {GAMES.map((game, index) => (
          <article className="game-card" key={game.title}>
            <div className="game-card-image">
              <LightboxImage src={`${ASSET_PREFIX}${game.image}`} alt={game.title} className="h-full w-full object-cover" />
              <span className="game-card-index">0{index + 1}</span>
            </div>
            <div className="game-card-body">
              <p className="project-tech">PLAYABLE · {index === 0 ? "ARCADE" : index === 1 ? "TRAINING" : index === 2 ? "LEARNING" : "STORY"}</p>
              <h3>{game.title}</h3>
              <p className="game-card-en">{game.en}</p>
              <p>{game.description}</p>
              <a href={game.href} target="_blank" rel="noreferrer" className="game-link">在线体验 <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

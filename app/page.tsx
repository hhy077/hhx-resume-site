import { LightboxImage } from "@/components/ui/lightbox-image";
import type { ReactNode } from "react";

const ASSET_PREFIX = process.env.NODE_ENV === "production" ? "/hhx-resume-site" : "";

const projects = [
  { title: "阳光花园 · 学习乐园", en: "Sunshine Garden · Learning Playground", desc: "面向 3–8 岁儿童的响应式学习平台，融合识字、算术、绘画与科普互动。", tech: "Product · Full-stack · AI Voice", image: `${ASSET_PREFIX}/projects/sunshine.jpg` },
  { title: "个人专属工作台", en: "Personal AI Workspace", desc: "用自然语言统一调度待办、文件搜索与日程协同的多智能体工作台。", tech: "Agent · Prompt · Tool Calling", image: `${ASSET_PREFIX}/projects/workspace.jpg` },
  { title: "文献智能辅助阅读工具", en: "AI Literature Reading Assistant", desc: "支持 PDF / 网页导入、摘要、术语解释和语义检索的科研阅读助手。", tech: "RAG · Embedding · Knowledge Base", image: `${ASSET_PREFIX}/projects/reading.jpg` },
];

export default function HomePage(): ReactNode {
  return (
    <main className="portfolio-shell">
      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow">AI APPLICATION BUILDER · FOOD SCIENCE × TECHNOLOGY</p>
          <h1>把复杂技术，<em>做成真正可用的工具。</em></h1>
          <p className="hero-lead">你好，我是霍华翔。食品科学与人工智能交叉方向的 AI 应用开发者，专注于大模型、智能体与友好界面的产品化实践。</p>
          <div className="hero-actions"><a className="button button-primary" href="#projects">查看项目 <span>↗</span></a><a className="button button-ghost" href="#contact">联系我 <span>↓</span></a></div>
        </div>
        <div className="portrait-wrap">
          <div className="portrait-orbit" />
          <div className="portrait-lightbox"><LightboxImage src={`${ASSET_PREFIX}/profile.png`} alt="霍华翔形象照" className="portrait" /></div>
          <div className="portrait-tag">H · H · X<br /><small>AI / FULL-STACK</small></div>
        </div>
      </section>

      <section className="marquee"><span>CURIOUS BY NATURE</span><span>·</span><span>BUILD WITH PURPOSE</span><span>·</span><span>LEARN IN PUBLIC</span><span>·</span><span>CURIOUS BY NATURE</span></section>
      <section className="intro-section" id="about"><div className="section-kicker">01 / ABOUT ME</div><div><h2>跨学科探索者，<br /><em>从想法到落地。</em></h2><p>我正在泉州师范学院学习食品科学与工程，同时持续探索大语言模型、智能体开发与人机交互。我的工作方式是先理解真实问题，再用合适的技术把它变成清晰、可靠、可持续迭代的体验。</p><div className="stats"><div><strong>3+</strong><span>AI 产品实践</span></div><div><strong>50+</strong><span>论文内部测试</span></div><div><strong>1.2s</strong><span>首屏加载目标</span></div></div></div></section>
      <section className="projects-section" id="projects"><div className="section-heading"><div className="section-kicker">02 / SELECTED WORK</div><h2>我正在构建的东西</h2><p>每个项目都来自一个具体问题，并以“内部测试”数据持续验证。</p></div><div className="project-grid">{projects.map((p, i) => <article className="project-card-custom" key={p.title}><div className="project-image"><LightboxImage src={p.image} alt={p.title} className="h-full w-full object-cover" /><span>0{i + 1}</span></div><div className="project-body"><p className="project-tech">{p.tech}</p><h3>{p.title}</h3><p className="project-en">{p.en}</p><p>{p.desc}</p><a href="#contact">了解项目 <span>↗</span></a></div></article>)}</div></section>
      <section className="game-showcase-section" id="games"><div className="section-kicker">03 / GAME SHOWCASE</div><div className="game-showcase-copy"><div><h2>制作游戏展示<br /><em>Game Showcase</em></h2><p>这里将展示我制作的游戏作品、玩法演示与在线体验入口。</p></div><div className="game-placeholder"><span className="game-placeholder-mark">+</span><strong>游戏图片待补充</strong><small>Game artwork and playable link coming soon</small></div></div></section>
      <section className="skills-section"><div className="section-kicker">04 / TOOLKIT</div><div className="skills-content"><h2>从模型到界面，<br /><em>保持好奇，也保持克制。</em></h2><div className="skill-list"><span>Python</span><span>LangChain</span><span>Agent Workflow</span><span>RAG / Embedding</span><span>Next.js</span><span>Responsive UI</span><span>Prompt Engineering</span><span>Figma</span></div></div></section>
      <section className="credentials-section"><div className="section-kicker">05 / CREDENTIALS</div><div className="credential-grid"><div><h2>持续学习，<br /><em>让能力有据可循。</em></h2><p>人工智能训练、Prompt 工程与 Agent 开发相关认证，均用于内部学习与项目实践展示。</p></div><div className="credential-list"><div><b>AI Training Specialist</b><span>人工智能训练师（初级 / 高级） · 2026</span></div><div><b>Prompt Engineer</b><span>Datawhale & 科大讯飞认证 · 2026</span></div><div><b>Agent Engineer × 2</b><span>Datawhale & 魔搭社区 / 文付宝 · 2026</span></div></div></div></section>
      <section className="contact-section" id="contact"><div className="section-kicker">06 / SAY HELLO</div><h2>有想法？<br /><em>我们聊聊。</em></h2><p>欢迎交流 AI 应用、学习实践或有趣的产品想法。</p><div className="contact-links"><a href="mailto:3526873890@qq.com">3526873890@qq.com</a><a href="tel:13297873579">132 9787 3579</a><span>微信：hhuay007</span><span>福建 · 泉州</span></div></section>
      <footer><span>© 2026 霍华翔 Huaxiang Huo</span><span>FOOD SCIENCE × AI</span><a href="#top">回到顶部 ↑</a></footer>
    </main>
  );
}

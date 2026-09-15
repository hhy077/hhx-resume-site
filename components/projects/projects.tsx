import { ArrowRight, BookOpen, Bot, Sparkles } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "@/components/ui/motion-primitives";

const ASSET_PREFIX = process.env.NODE_ENV === "production" ? "/hhx-resume-site" : "";

type Project = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  iconLabel: string;
  title: string;
  description: string;
  meta: string;
  imageRatio: number;
  image: string;
  imageAlt: string;
};

const PROJECTS: Project[] = [
  {
    id: "sunshine-garden",
    icon: Sparkles,
    iconLabel: "Sunshine Garden",
    title: "阳光花园 · 学习乐园",
    description: "面向 3–8 岁儿童的响应式学习平台，融合识字、算术、绘画与科普互动。",
    meta: "产品负责人 & 全栈开发者 · 内部测试 · 2026",
    imageRatio: 752 / 497,
    image: `${ASSET_PREFIX}/project-garden.jpg`,
    imageAlt: "阳光花园学习乐园项目界面",
  },
  {
    id: "personal-workspace",
    icon: Bot,
    iconLabel: "Personal AI Workspace",
    title: "个人专属工作台",
    description: "通过多智能体协作、工具调用和知识检索，用自然语言统一调度任务、日历与文件。",
    meta: "AI 效率工具开发者 · 内部测试 · 2026",
    imageRatio: 1024 / 768,
    image: `${ASSET_PREFIX}/project-workbench.jpg`,
    imageAlt: "个人专属工作台项目界面",
  },
  {
    id: "literature-reader",
    icon: BookOpen,
    iconLabel: "AI Literature Reader",
    title: "文献智能辅助阅读工具",
    description: "支持 PDF 与网页导入、自动摘要、术语解释、语义检索和原文定位。",
    meta: "AI 科研工具开发者 · 内部测试 · 2026",
    imageRatio: 1024 / 768,
    image: `${ASSET_PREFIX}/project-reader.jpg`,
    imageAlt: "文献智能辅助阅读工具项目界面",
  },
];

export type ProjectsProps = {
  withHeadline?: boolean;
  viewMoreVisible?: boolean;
};

export function Projects({
  withHeadline = false,
  viewMoreVisible = false,
}: ProjectsProps): ReactNode {
  const items = viewMoreVisible ? PROJECTS.slice(0, 4) : PROJECTS;

  return (
    <section className="relative w-full">
      <div className="mx-auto w-full max-w-275 px-6 sm:px-10">
        {withHeadline ? (
          <FadeIn className="flex flex-col items-center gap-5 pt-12 pb-10 text-center sm:pt-20 sm:pb-14">
            <h2 className="font-serif text-[2.5rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3rem] lg:text-[3.5rem]">
              我的项目 · My projects
            </h2>
            <p className="max-w-[33ch] text-[18px] leading-[1.45] tracking-tight text-foreground/65 sm:text-[20px]">
              从跨学科实验到智能工具，记录我正在构建和验证的产品实践。
            </p>
          </FadeIn>
        ) : null}

        <div className="columns-1 gap-6 md:columns-2 md:gap-7">
          {items.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {viewMoreVisible ? (
          <div className="mt-12 flex justify-center sm:mt-16">
            <Link
              href="/projects"
              className="border border-foreground/8 focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              查看全部项目 · View all
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}): ReactNode {
  const Icon = project.icon;
  return (
    <FadeIn
      delay={Math.min(index * 0.06, 0.3)}
      className="mb-6 break-inside-avoid md:mb-7"
    >
      <article className="project-card flex cursor-pointer flex-col gap-4 rounded-3xl border border-foreground/8 bg-background p-3 sm:p-3.5">
        <header className="flex items-center gap-2.5 px-1 pt-2">
          <span className="border-foreground/10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background">
            <Icon className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium tracking-tight text-foreground">
            {project.iconLabel}
          </span>
        </header>

        <div
          className="project-card__image ring-foreground/5 relative w-full overflow-hidden rounded-2xl bg-foreground/5 ring-1"
          style={{ aspectRatio: project.imageRatio }}
        >
          <div className="project-card__image-inner">
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              sizes="(min-width: 1024px) 540px, (min-width: 768px) 45vw, 100vw"
              className="object-cover"
              priority={index < 2}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 px-1 pb-1">
          <h3 className="text-[20px] font-medium leading-[1.2] tracking-tight text-foreground sm:text-[22px]">
            {project.title}
          </h3>
          <p className="text-[14px] leading-normal tracking-tight text-foreground/65 sm:text-[15px]">
            {project.description}
          </p>
        </div>

        <p className="px-1 pb-2 text-[12px] tracking-tight text-foreground/50">
          {project.meta}
        </p>
      </article>
    </FadeIn>
  );
}




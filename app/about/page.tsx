import { Education } from "@/components/about/education";
import { Experience } from "@/components/about/experience";
import { Certificates } from "@/components/about/certificates";
import { PolaroidStrip } from "@/components/about/polaroid-strip";
import { Skills } from "@/components/about/skills";
import { Stack } from "@/components/about/stack";
import { ContactCard } from "@/components/contact/contact-card";
import { FadeIn } from "@/components/ui/motion-primitives";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "About",
  description: "About me, background, and how to get in touch.",
  path: "/about",
});

export default function AboutPage(): ReactNode {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-312 pt-40 sm:pt-56">
        <PolaroidStrip />
      </section>

      <section className="mx-auto w-full max-w-160 px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-24">
        <FadeIn delay={0.5}>
          <div className="rounded-4xl border border-foreground/5 bg-foreground/1.5 p-8 sm:p-12 dark:bg-foreground/3">
            <h1 className="font-serif text-[1.75rem] font-medium tracking-tight text-foreground sm:text-[2rem]">
              你好，我是 <span className="border-b border-foreground/30 pb-0.5">霍华翔 Huaxiang Huo</span>。
            </h1>
            <div className="mt-8 space-y-6 text-[17px] leading-[1.7] tracking-tight text-foreground/75 sm:text-[18px]">
              <p>
                我是一名专注于 <strong className="font-semibold text-foreground">AI 应用产品设计与全栈开发</strong> 的跨学科学习者，正在泉州师范学院学习食品科学与工程，并持续探索大语言模型、智能体与人机交互。
              </p>
              <p>
                我关注真实问题如何被转化为清晰、可靠、可迭代的工具，已经完成儿童学习平台、个人 AI 工作台和文献阅读助手等内部测试项目。
              </p>
              <p>
                我的方向是把 <strong className="font-semibold text-foreground">食品科学 × 人工智能</strong> 的学习背景，和产品思维、Prompt、Agent、RAG 及响应式 Web 开发结合起来。
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="mx-auto w-full max-w-[40rem] px-6 pb-20 sm:px-10 sm:pb-28">
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-10">
            <Experience />
            <Education />
            <Skills />
            <Stack />
            <Certificates />
          </div>
        </FadeIn>
      </section>

      <ContactCard />
      <div className="h-12 sm:h-16" />
    </main>
  );
}

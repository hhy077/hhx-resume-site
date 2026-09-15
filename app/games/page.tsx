import { ContactCard } from "@/components/contact/contact-card";
import { GameShowcase } from "@/components/games/game-showcase";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Games",
  description: "Playable games and interactive experiences by Huaxiang Huo.",
  path: "/games",
});

export default function GamesPage(): ReactNode {
  return (
    <main id="main-content" className="games-page">
      <GameShowcase />
      <ContactCard />
      <div className="h-12 sm:h-16" />
    </main>
  );
}

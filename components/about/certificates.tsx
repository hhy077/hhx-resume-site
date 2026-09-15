import { LightboxImage } from "@/components/ui/lightbox-image";

const ASSET_PREFIX = process.env.NODE_ENV === "production" ? "/hhx-resume-site" : "";

const CERTIFICATES = [
  ["人工智能训练师（初级）", "AI Trainer · Junior", "/certificate-ai-trainer-junior.jpg"],
  ["人工智能训练师（高级）", "AI Trainer · Advanced", "/certificate-ai-trainer-advanced.jpg"],
  ["Prompt Engineer", "Datawhale × 讯飞星火", "/certificate-prompt-engineer.jpg"],
  ["Agent Engineer", "Datawhale × ModelScope", "/certificate-agent-modelscope.jpg"],
  ["Agent Engineer", "Datawhale × 蚂蚁集团百宝箱", "/certificate-agent-ant.jpg"],
] as const;

export function Certificates() {
  return (
    <section>
      <h3 className="text-[15px] font-semibold">证书与认证 / Certificates</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {CERTIFICATES.map(([title, subtitle, image]) => (
          <figure className="overflow-hidden rounded-3xl border border-foreground/8 bg-background" key={image}>
            <LightboxImage src={`${ASSET_PREFIX}${image}`} alt={`${title} ${subtitle}`} className="h-auto w-full object-cover" />
            <figcaption className="p-4 text-sm">
              <div className="font-medium">{title}</div>
              <div className="mt-1 text-xs text-foreground/50">{subtitle} · 2026</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

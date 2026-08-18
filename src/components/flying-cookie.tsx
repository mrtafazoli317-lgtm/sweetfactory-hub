import { useEffect, useRef } from "react";

type Props = {
  src: string;
  /** id of the section the cookie should land on */
  targetId: string;
  /** id of the hero element used for the mouse parallax */
  heroId: string;
};

const MAX_ROTATION = 292;

export function FlyingCookie({ src, targetId, heroId }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let baseX = 0;
    let baseY = 0;
    let targetX = 0;
    let targetY = 0;
    let endScroll = 1;
    let pointerX = 0;
    let pointerY = 0;
    let curPointerX = 0;
    let curPointerY = 0;
    let frame = 0;

    const measure = () => {
      el.style.transform = "none";
      const r = el.getBoundingClientRect();
      baseX = r.left + r.width / 2 + window.scrollX;
      baseY = r.top + r.height / 2 + window.scrollY;

      const target = document.getElementById(targetId);
      if (target) {
        const tr = target.getBoundingClientRect();
        targetX = tr.left + tr.width / 2 + window.scrollX;
        targetY = tr.top + window.scrollY + Math.min(tr.height * 0.2, 120);
        endScroll = Math.max(240, targetY - window.innerHeight * 0.55);
      } else {
        targetX = baseX;
        targetY = baseY;
      }
      render();
    };

    const render = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / endScroll));
      const eased = p * p * (3 - 2 * p);
      curPointerX += (pointerX - curPointerX) * 0.08;
      curPointerY += (pointerY - curPointerY) * 0.08;
      const fade = 1 - eased;
      const x = (targetX - baseX) * eased + curPointerX * fade;
      const y = (targetY - baseY) * eased + curPointerY * fade;
      const scale = 1 - 0.6 * eased;
      const rotate = MAX_ROTATION * eased;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
    };

    const loop = () => {
      render();
      frame = requestAnimationFrame(loop);
    };

    const onPointer = (e: MouseEvent) => {
      const hero = document.getElementById(heroId);
      if (!hero) return;
      const r = hero.getBoundingClientRect();
      const rx = (e.clientX - r.left) / r.width - 0.5;
      const ry = (e.clientY - r.top) / r.height - 0.5;
      pointerX = -rx * 60;
      pointerY = -ry * 40;
    };

    const desktop = window.matchMedia("(min-width: 768px)");
    const bindPointer = () => {
      if (desktop.matches) {
        document.getElementById(heroId)?.addEventListener("mousemove", onPointer);
      } else {
        pointerX = 0;
        pointerY = 0;
        document.getElementById(heroId)?.removeEventListener("mousemove", onPointer);
      }
    };

    measure();
    bindPointer();
    frame = requestAnimationFrame(loop);
    window.addEventListener("resize", measure);
    desktop.addEventListener("change", bindPointer);
    const t = window.setTimeout(measure, 600);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      desktop.removeEventListener("change", bindPointer);
      document.getElementById(heroId)?.removeEventListener("mousemove", onPointer);
    };
  }, [heroId, targetId]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-2 top-24 z-20 w-40 will-change-transform sm:left-6 md:left-16 md:top-28 md:w-72 lg:w-80"
    >
      <div className="relative">
        <img
          src={src}
          alt=""
          loading="eager"
          className="size-full rounded-full object-cover shadow-lift ring-4 ring-gold/40"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-espresso/30 bg-gradient-to-br from-gold to-gold-soft text-[0.65rem] font-extrabold tracking-[0.12em] text-espresso shadow-soft md:size-24 md:text-sm">
            20KAM
          </div>
        </div>
      </div>
    </div>
  );
}

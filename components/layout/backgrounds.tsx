'use client';

import Image from 'next/image';

export function GradientLight() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-[40%] left-0 right-0 bottom-0 bg-[radial-gradient(circle_800px_at_50%_-40%,rgba(120,119,198,0.3),transparent)]" />
    </div>
  );
}

export function GlowBackground() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Image
        src="/assets/bg/glow.png"
        alt="Glow background"
        fill
        className="object-cover opacity-50"
        priority
      />
    </div>
  );
}

export function GridPattern() {
  return (
    <div className="absolute inset-0 h-full w-full bg-grid-white/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]" />
  );
}

export function GlowingOrb() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="h-[300px] w-[300px] rounded-full bg-gradient-to-r from-violet-500/30 to-purple-500/30 blur-3xl" />
    </div>
  );
}

export function LightShelf() {
  return (
    <div className="absolute inset-0">
      <Image
        src="/assets/bg/light.svg"
        alt="Light shelf"
        fill
        className="object-cover opacity-20"
      />
    </div>
  );
}

export function Shadow1() {
  return (
    <div className="absolute inset-0">
      <Image
        src="/assets/home/advantage/1-shadow.png"
        alt="Shadow 1"
        fill
        className="object-cover opacity-10"
      />
    </div>
  );
}

export function Shadow2() {
  return (
    <div className="absolute inset-0">
      <Image
        src="/assets/home/advantage/2-shadow.png"
        alt="Shadow 2"
        fill
        className="object-cover mix-blend-overlay opacity-40"
      />
    </div>
  );
}

export function Shadow3() {
  return (
    <div className="absolute inset-0">
      <Image
        src="/assets/home/advantage/3-shadow.png"
        alt="Shadow 3"
        fill
        className="object-cover mix-blend-overlay opacity-40"
      />
    </div>
  );
}

export function mainBG() {
  return (
    <div className="absolute inset-0">
      <Image src="/assets/home/hero/bg.svg" alt="Main background" fill className="object-cover" />
    </div>
  );
}

export function RadialGradient() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
    </div>
  );
}

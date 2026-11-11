/**
 * تولید تصاویر نمونه به صورت SVG — بدون هیچ محتوای دارای حق‌نشر.
 * این اسکریپت در زمان seed اجرا می‌شود و فایل‌ها را در public/images می‌نویسد.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "public", "images");

type Palette = { from: string; to: string; accent: string; ink: string };

const PALETTES: Record<string, Palette[]> = {
  digital: [
    { from: "#0ea5e9", to: "#6366f1", accent: "#e0f2fe", ink: "#0f172a" },
    { from: "#14b8a6", to: "#0d9488", accent: "#ccfbf1", ink: "#042f2e" },
    { from: "#8b5cf6", to: "#6d28d9", accent: "#ede9fe", ink: "#1e1b4b" },
    { from: "#f59e0b", to: "#ea580c", accent: "#ffedd5", ink: "#431407" },
  ],
  home: [
    { from: "#f59e0b", to: "#d97706", accent: "#fef3c7", ink: "#451a03" },
    { from: "#84cc16", to: "#4d7c0f", accent: "#ecfccb", ink: "#1a2e05" },
    { from: "#06b6d4", to: "#0e7490", accent: "#cffafe", ink: "#083344" },
  ],
  fashion: [
    { from: "#ec4899", to: "#be185d", accent: "#fce7f3", ink: "#500724" },
    { from: "#8b5cf6", to: "#6d28d9", accent: "#ede9fe", ink: "#2e1065" },
    { from: "#f97316", to: "#c2410c", accent: "#ffedd5", ink: "#431407" },
  ],
  beauty: [
    { from: "#f472b6", to: "#db2777", accent: "#fce7f3", ink: "#500724" },
    { from: "#a78bfa", to: "#7c3aed", accent: "#f3e8ff", ink: "#3b0764" },
  ],
  sport: [
    { from: "#22c55e", to: "#15803d", accent: "#dcfce7", ink: "#052e16" },
    { from: "#0ea5e9", to: "#0369a1", accent: "#e0f2fe", ink: "#082f49" },
  ],
  books: [
    { from: "#eab308", to: "#a16207", accent: "#fef9c3", ink: "#422006" },
    { from: "#38bdf8", to: "#0284c7", accent: "#e0f2fe", ink: "#082f49" },
  ],
  grocery: [
    { from: "#f97316", to: "#c2410c", accent: "#ffedd5", ink: "#431407" },
    { from: "#10b981", to: "#047857", accent: "#d1fae5", ink: "#022c22" },
  ],
  toys: [
    { from: "#f43f5e", to: "#be123c", accent: "#ffe4e6", ink: "#4c0519" },
    { from: "#06b6d4", to: "#0891b2", accent: "#cffafe", ink: "#083344" },
  ],
  default: [{ from: "#14b8a6", to: "#0f766e", accent: "#ccfbf1", ink: "#042f2e" }],
};

function pal(family: string, seed: number): Palette {
  const list = PALETTES[family] ?? PALETTES.default;
  return list[seed % list.length];
}

/** شکل محصول بر اساس خانواده‌ی کالا */
function silhouette(family: string, p: Palette, v: number) {
  const g = p.from;
  const a = p.accent;
  const rot = (v % 4) * 2 - 3;

  if (family === "digital") {
    return `
    <g transform="rotate(${rot} 400 380)">
      <rect x="268" y="196" width="264" height="392" rx="46" fill="#0f172a" opacity="0.92"/>
      <rect x="282" y="212" width="236" height="360" rx="34" fill="url(#screen)"/>
      <rect x="356" y="214" width="88" height="14" rx="7" fill="#0f172a" opacity="0.55"/>
      <circle cx="400" cy="560" r="7" fill="${a}" opacity="0.6"/>
      <g opacity="0.35" stroke="${a}" stroke-width="2">
        <path d="M312 300h120" stroke-linecap="round"/>
        <path d="M312 330h176" stroke-linecap="round"/>
        <path d="M312 360h96" stroke-linecap="round"/>
      </g>
      <g opacity="0.5">
        <rect x="312" y="404" width="72" height="72" rx="18" fill="${a}" opacity="0.55"/>
        <rect x="392" y="404" width="72" height="72" rx="18" fill="${a}" opacity="0.3"/>
        <rect x="472" y="404" width="34" height="72" rx="17" fill="${a}" opacity="0.45"/>
      </g>
    </g>
    <g opacity="0.5">
      <rect x="560" y="250" width="86" height="140" rx="22" fill="${g}" opacity="0.3"/>
      <rect x="576" y="266" width="54" height="74" rx="12" fill="${g}" opacity="0.45"/>
      <circle cx="603" cy="362" r="9" fill="${g}" opacity="0.6"/>
    </g>`;
  }
  if (family === "home") {
    return `
    <g transform="rotate(${rot} 400 390)">
      <rect x="248" y="300" width="304" height="230" rx="28" fill="#fff" opacity="0.92"/>
      <rect x="272" y="330" width="256" height="160" rx="18" fill="${a}" opacity="0.75"/>
      <path d="M248 300c40-70 120-108 152-108s112 38 152 108z" fill="#fff" opacity="0.85"/>
      <rect x="336" y="470" width="128" height="60" rx="12" fill="${g}" opacity="0.45"/>
      <g opacity="0.55" stroke="${g}" stroke-width="3">
        <path d="M312 376h176" stroke-linecap="round"/>
        <path d="M312 416h120" stroke-linecap="round"/>
      </g>
    </g>`;
  }
  if (family === "fashion") {
    return `
    <g transform="rotate(${rot} 400 380)">
      <path d="M330 214l70 44 70-44 60 34-26 82 34 42-38 40-30-32v186a26 26 0 0 1-26 26h-88a26 26 0 0 1-26-26V380l-30 32-38-40 34-42-26-82z" fill="#fff" opacity="0.94"/>
      <path d="M400 258v330" stroke="${a}" stroke-width="3" opacity="0.5" stroke-dasharray="8 10"/>
      <circle cx="400" cy="286" r="18" fill="${g}" opacity="0.35"/>
    </g>`;
  }
  if (family === "beauty") {
    return `
    <g transform="rotate(${rot} 400 390)">
      <rect x="330" y="166" width="140" height="60" rx="16" fill="${g}" opacity="0.5"/>
      <rect x="300" y="236" width="200" height="330" rx="42" fill="#fff" opacity="0.94"/>
      <rect x="320" y="300" width="160" height="150" rx="22" fill="${a}" opacity="0.9"/>
      <circle cx="400" cy="494" r="26" fill="${g}" opacity="0.25"/>
      <path d="M352 356h96" stroke="${g}" stroke-width="3" opacity="0.4" stroke-linecap="round"/>
      <path d="M352 388h64" stroke="${g}" stroke-width="3" opacity="0.4" stroke-linecap="round"/>
    </g>`;
  }
  if (family === "sport") {
    return `
    <g transform="rotate(${rot} 400 390)">
      <circle cx="400" cy="400" r="170" fill="#fff" opacity="0.94"/>
      <circle cx="400" cy="400" r="170" fill="none" stroke="${g}" stroke-width="4" opacity="0.35"/>
      <path d="M400 240c46 40 70 92 70 160s-24 120-70 160" fill="none" stroke="${g}" stroke-width="3" opacity="0.4"/>
      <path d="M400 240c-46 40-70 92-70 160s24 120 70 160" fill="none" stroke="${g}" stroke-width="3" opacity="0.4"/>
      <path d="M250 340h300M250 460h300" stroke="${g}" stroke-width="3" opacity="0.35"/>
      <circle cx="400" cy="400" r="44" fill="${a}" opacity="0.9"/>
    </g>`;
  }
  if (family === "books") {
    return `
    <g transform="rotate(${rot} 400 390)">
      <rect x="266" y="196" width="268" height="376" rx="18" fill="#fff" opacity="0.94"/>
      <rect x="266" y="196" width="38" height="376" rx="12" fill="${g}" opacity="0.45"/>
      <rect x="330" y="258" width="164" height="18" rx="9" fill="${g}" opacity="0.55"/>
      <rect x="330" y="298" width="120" height="12" rx="6" fill="${g}" opacity="0.3"/>
      <g opacity="0.45">
        <path d="M330 370h164M330 404h164M330 438h120" stroke="${g}" stroke-width="8" stroke-linecap="round"/>
      </g>
    </g>`;
  }
  if (family === "grocery") {
    return `
    <g transform="rotate(${rot} 400 390)">
      <path d="M296 244h208l-26 330a34 34 0 0 1-34 30H356a34 34 0 0 1-34-30z" fill="#fff" opacity="0.94"/>
      <path d="M344 244c0-44 24-72 56-72s56 28 56 72" fill="none" stroke="${g}" stroke-width="10" opacity="0.4" stroke-linecap="round"/>
      <rect x="330" y="330" width="140" height="130" rx="20" fill="${a}" opacity="0.9"/>
      <circle cx="400" cy="395" r="30" fill="${g}" opacity="0.3"/>
    </g>`;
  }
  return `
  <g transform="rotate(${rot} 400 390)">
    <rect x="272" y="252" width="256" height="256" rx="52" fill="#fff" opacity="0.94"/>
    <circle cx="400" cy="380" r="72" fill="${a}" opacity="0.9"/>
    <circle cx="400" cy="380" r="34" fill="${g}" opacity="0.4"/>
    <rect x="332" y="470" width="136" height="18" rx="9" fill="${g}" opacity="0.35"/>
  </g>`;
}

export function makeProductSvg(family: string, seed: number, variant = 0): string {
  const p = pal(family, seed + variant);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.accent}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.from}"/>
      <stop offset="1" stop-color="${p.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="52%">
      <stop offset="0" stop-color="${p.from}" stop-opacity="0.28"/>
      <stop offset="1" stop-color="${p.from}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <circle cx="400" cy="360" r="300" fill="url(#glow)"/>
  <g opacity="0.35">
    <circle cx="140" cy="150" r="54" fill="${p.from}" opacity="0.14"/>
    <circle cx="676" cy="206" r="26" fill="${p.to}" opacity="0.2"/>
    <circle cx="650" cy="646" r="70" fill="${p.from}" opacity="0.1"/>
    <circle cx="132" cy="612" r="18" fill="${p.to}" opacity="0.22"/>
  </g>
  <g filter="none">${silhouette(family, p, variant)}</g>
  <ellipse cx="400" cy="672" rx="190" ry="26" fill="${p.ink}" opacity="0.06"/>
</svg>`;
}

export function makeBannerSvg(theme: string, seed = 0): string {
  const themes: Record<string, [string, string, string]> = {
    brand: ["#0f766e", "#134e4a", "#5eead4"],
    accent: ["#f97316", "#c2410c", "#fed7aa"],
    dark: ["#0f172a", "#1e293b", "#38bdf8"],
    light: ["#e0f2fe", "#ccfbf1", "#0ea5e9"],
  };
  const [from, to, accent] = themes[theme] ?? themes.brand;
  const light = theme === "light";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="700" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="h" cx="76%" cy="30%" r="46%">
      <stop offset="0" stop-color="${accent}" stop-opacity="${light ? 0.5 : 0.42}"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="700" fill="url(#b)"/>
  <rect width="1600" height="700" fill="url(#h)"/>
  <g fill="none" stroke="${accent}" stroke-width="2" opacity="${light ? 0.35 : 0.22}">
    <circle cx="1290" cy="180" r="150"/>
    <circle cx="1290" cy="180" r="230"/>
    <circle cx="1290" cy="180" r="320"/>
  </g>
  <g opacity="${light ? 0.35 : 0.18}" fill="${accent}">
    <circle cx="1500" cy="600" r="120"/>
    <circle cx="180" cy="80" r="60"/>
  </g>
  <g transform="translate(${1180 + seed * 8} 330) rotate(-12)" opacity="${light ? 0.5 : 0.3}">
    <rect x="0" y="0" width="180" height="300" rx="28" fill="${accent}"/>
    <rect x="14" y="16" width="152" height="268" rx="18" fill="${to}" opacity="0.55"/>
  </g>
  <g transform="translate(${1330 + seed * 6} 420) rotate(10)" opacity="${light ? 0.4 : 0.25}">
    <rect x="0" y="0" width="150" height="240" rx="24" fill="${accent}"/>
  </g>
</svg>`;
}

/** لوگوی عمومی برند — مونوگرام ساده، بدون استفاده از لوگوی واقعی */
export function makeBrandSvg(name: string, seed = 0): string {
  const p = pal("default", seed);
  const letters = name.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.from}"/><stop offset="1" stop-color="${p.to}"/>
    </linearGradient>
  </defs>
  <rect width="320" height="160" rx="24" fill="#ffffff"/>
  <rect x="24" y="36" width="88" height="88" rx="22" fill="url(#g)"/>
  <text x="68" y="94" text-anchor="middle" font-family="Tahoma, sans-serif" font-size="34" font-weight="700" fill="#ffffff">${letters}</text>
  <text x="132" y="86" font-family="Tahoma, sans-serif" font-size="20" font-weight="700" fill="#0f172a">${name}</text>
  <rect x="132" y="98" width="70" height="6" rx="3" fill="${p.from}" opacity="0.4"/>
</svg>`;
}

/** تصویر دسته‌بندی — ترکیب گرادیان و شکل */
export function makeCategorySvg(family: string, seed = 0): string {
  const p = pal(family, seed);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img">
  <defs>
    <linearGradient id="c" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.accent}"/><stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#c)"/>
  <circle cx="200" cy="190" r="120" fill="${p.from}" opacity="0.16"/>
  <g transform="translate(200 190)">
    <rect x="-52" y="-52" width="104" height="104" rx="30" fill="${p.from}" opacity="0.85"/>
    <rect x="-32" y="-32" width="44" height="44" rx="12" fill="#ffffff" opacity="0.9"/>
    <circle cx="22" cy="18" r="16" fill="#ffffff" opacity="0.6"/>
  </g>
</svg>`;
}

export function writeImage(relPath: string, content: string) {
  const full = join(ROOT, relPath);
  const dir = join(full, "..");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(full, content, "utf8");
}

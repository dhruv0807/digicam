export type CameraStyle = "compact" | "slim" | "chunky" | "zoom" | "rounded";

export type CameraSpec = {
  id: string;
  brand: string;
  model: string;
  word: string;
  era: string;
  headline: string[];
  description: string;
  specs: { label: string; value: string }[];
  /** radial-gradient background for the section */
  bg: string;
  /** text tone for the section: light text on dark worlds */
  tone: "light" | "dark";
  accent: string;
  lcd: { tint: string; scene: string };
  body: {
    color: string;
    trim: string;
    metalness: number;
    roughness: number;
    style: CameraStyle;
  };
};

export const CAMERAS: CameraSpec[] = [
  {
    id: "sony",
    brand: "Sony",
    model: "Cyber-shot era",
    word: "CYBER-SHOT",
    era: "Early 2000s",
    headline: ["POCKET-SIZED.", "PIXEL-POWERED."],
    description: "Before smartphones became cameras, this was how memories lived.",
    specs: [
      { label: "Year", value: "2004" },
      { label: "Sensor", value: "5.1 MP CCD" },
      { label: "Zoom", value: "3× Optical" },
      { label: "Display", value: '2.0"' },
      { label: "Memory", value: "Memory Stick" },
    ],
    bg: "radial-gradient(circle at 50% 45%, #F5F5F5 0%, #C7CCD1 45%, #25292D 100%)",
    tone: "dark",
    accent: "#2b6ea8",
    lcd: { tint: "#9fd6ff", scene: "beach" },
    body: { color: "#c9ced3", trim: "#6d7379", metalness: 0.95, roughness: 0.26, style: "compact" },
  },
  {
    id: "nikon",
    brand: "Nikon",
    model: "Coolpix era",
    word: "COOLPIX",
    era: "Mid 2000s",
    headline: ["POINT.", "SHOOT.", "REMEMBER."],
    description: "A little camera that carried an entire summer in its memory card.",
    specs: [
      { label: "Year", value: "2005" },
      { label: "Sensor", value: "5.1 MP CCD" },
      { label: "Zoom", value: "3× Optical" },
      { label: "Display", value: '2.0"' },
      { label: "Memory", value: "SD Card" },
    ],
    bg: "radial-gradient(circle at 50% 45%, #263426 0%, #111811 50%, #050605 100%)",
    tone: "light",
    accent: "#7ee08a",
    lcd: { tint: "#8ef0a0", scene: "party" },
    body: { color: "#1b1d1e", trim: "#b9bfc4", metalness: 0.55, roughness: 0.42, style: "zoom" },
  },
  {
    id: "fuji",
    brand: "Fujifilm",
    model: "FinePix era",
    word: "FINEPIX",
    era: "Mid / late 2000s",
    headline: ["EVERYDAY", "MEMORIES."],
    description: "Simple cameras. Warm colors. Endless photos.",
    specs: [
      { label: "Year", value: "2007" },
      { label: "Sensor", value: "8 MP CCD" },
      { label: "Zoom", value: "3× Optical" },
      { label: "Display", value: '2.5"' },
      { label: "Memory", value: "xD-Picture" },
    ],
    bg: "radial-gradient(circle at 50% 45%, #E8F0DD 0%, #9EB58B 45%, #32472F 100%)",
    tone: "dark",
    accent: "#2f6b3b",
    lcd: { tint: "#cdf0b8", scene: "school" },
    body: { color: "#e6e2d6", trim: "#8d9a7d", metalness: 0.5, roughness: 0.45, style: "rounded" },
  },
  {
    id: "samsung",
    brand: "Samsung",
    model: "Digimax era",
    word: "DIGIMAX",
    era: "2000s",
    headline: ["THE FUTURE", "LOOKED LIKE THIS."],
    description: "Digital photography before everything became glass.",
    specs: [
      { label: "Year", value: "2003" },
      { label: "Sensor", value: "4 MP CCD" },
      { label: "Zoom", value: "3× Optical" },
      { label: "Display", value: '1.6"' },
      { label: "Memory", value: "SD Card" },
    ],
    bg: "radial-gradient(circle at 50% 45%, #D9F5FF 0%, #5FB9D8 45%, #092F43 100%)",
    tone: "dark",
    accent: "#0d6c93",
    lcd: { tint: "#a6e9ff", scene: "city" },
    body: { color: "#b5bcc2", trim: "#4b5257", metalness: 0.85, roughness: 0.33, style: "chunky" },
  },
  {
    id: "canon",
    brand: "Canon",
    model: "PowerShot era",
    word: "POWERSHOT",
    era: "2000s",
    headline: ["CLICK.", "CAPTURE.", "KEEP."],
    description: "The camera that lived in pockets, backpacks and family holidays.",
    specs: [
      { label: "Year", value: "2006" },
      { label: "Sensor", value: "6 MP CCD" },
      { label: "Zoom", value: "3× Optical" },
      { label: "Display", value: '2.5"' },
      { label: "Memory", value: "SD Card" },
    ],
    bg: "radial-gradient(circle at 50% 45%, #FFF5F2 0%, #F0B3A9 45%, #681D19 100%)",
    tone: "dark",
    accent: "#a52a1f",
    lcd: { tint: "#ffd0c4", scene: "holiday" },
    body: { color: "#d7dade", trim: "#7c3029", metalness: 0.9, roughness: 0.28, style: "compact" },
  },
  {
    id: "olympus",
    brand: "Olympus",
    model: "µ / Stylus era",
    word: "STYLUS",
    era: "2000s",
    headline: ["SMALLER", "THAN THE MEMORY."],
    description: "Pocket-sized technology built for everywhere.",
    specs: [
      { label: "Year", value: "2005" },
      { label: "Sensor", value: "5 MP CCD" },
      { label: "Zoom", value: "3× Optical" },
      { label: "Display", value: '2.5"' },
      { label: "Memory", value: "xD-Picture" },
    ],
    bg: "radial-gradient(circle at 50% 45%, #E8F5FA 0%, #8FC3D3 45%, #1C4654 100%)",
    tone: "dark",
    accent: "#1f6b85",
    lcd: { tint: "#bfe8f5", scene: "roadtrip" },
    body: { color: "#cdd4d8", trim: "#3f4a50", metalness: 1, roughness: 0.22, style: "rounded" },
  },
  {
    id: "lumix",
    brand: "Panasonic",
    model: "Lumix era",
    word: "LUMIX",
    era: "Late 2000s",
    headline: ["MORE ZOOM.", "MORE WORLD."],
    description: "Bring the faraway a little closer.",
    specs: [
      { label: "Year", value: "2008" },
      { label: "Sensor", value: "10 MP CCD" },
      { label: "Zoom", value: "10× Optical" },
      { label: "Display", value: '2.7"' },
      { label: "Memory", value: "SD Card" },
    ],
    bg: "radial-gradient(circle at 50% 45%, #252A2E 0%, #11151A 50%, #020303 100%)",
    tone: "light",
    accent: "#4aa8ff",
    lcd: { tint: "#9ec9ff", scene: "sunset" },
    body: { color: "#17191c", trim: "#2f6fb0", metalness: 0.6, roughness: 0.4, style: "zoom" },
  },
  {
    id: "casio",
    brand: "Casio",
    model: "Exilim era",
    word: "EXILIM",
    era: "2000s",
    headline: ["THIN.", "SHINY.", "UNNECESSARILY COOL."],
    description: "The camera you wanted because it looked like the future.",
    specs: [
      { label: "Year", value: "2006" },
      { label: "Sensor", value: "6 MP CCD" },
      { label: "Zoom", value: "3× Optical" },
      { label: "Display", value: '2.5"' },
      { label: "Memory", value: "SD Card" },
    ],
    bg: "radial-gradient(circle at 50% 45%, #FFE7F1 0%, #EBAAC6 45%, #713A57 100%)",
    tone: "dark",
    accent: "#b1416f",
    lcd: { tint: "#ffc9df", scene: "friends" },
    body: { color: "#e9c2d2", trim: "#8c5f72", metalness: 0.95, roughness: 0.2, style: "slim" },
  },
  {
    id: "kodak",
    brand: "Kodak",
    model: "EasyShare era",
    word: "EASYSHARE",
    era: "2000s",
    headline: ["PRESS", "THE BUTTON."],
    description: "Photography without overthinking it.",
    specs: [
      { label: "Year", value: "2004" },
      { label: "Sensor", value: "4 MP CCD" },
      { label: "Zoom", value: "3× Optical" },
      { label: "Display", value: '1.8"' },
      { label: "Memory", value: "SD Card" },
    ],
    bg: "radial-gradient(circle at 50% 45%, #FFF1B8 0%, #E6B52C 45%, #8C280F 100%)",
    tone: "dark",
    accent: "#9c3312",
    lcd: { tint: "#ffe9a8", scene: "birthday" },
    body: { color: "#d9dade", trim: "#e0a417", metalness: 0.45, roughness: 0.5, style: "chunky" },
  },
];

export const COLOR_VARIANTS = [
  { name: "Silver", color: "#c9ced3", trim: "#6d7379", metalness: 0.95, roughness: 0.25, accent: "#5b6b7a" },
  { name: "Black", color: "#1b1d1e", trim: "#8f979d", metalness: 0.6, roughness: 0.4, accent: "#3b4148" },
  { name: "Pink", color: "#e8aec6", trim: "#8c5f72", metalness: 0.9, roughness: 0.22, accent: "#b1416f" },
  { name: "Blue", color: "#7fb4d8", trim: "#2c4b63", metalness: 0.9, roughness: 0.25, accent: "#1f6b95" },
  { name: "Champagne", color: "#e2d2b0", trim: "#8a7a5c", metalness: 0.85, roughness: 0.3, accent: "#8a6b33" },
  { name: "White", color: "#f0f1f2", trim: "#a8adb2", metalness: 0.4, roughness: 0.45, accent: "#6b7278" },
  { name: "Red", color: "#b8352c", trim: "#5d1b16", metalness: 0.8, roughness: 0.3, accent: "#8c241c" },
  { name: "Green", color: "#7fae7a", trim: "#3a5638", metalness: 0.7, roughness: 0.35, accent: "#33552f" },
];

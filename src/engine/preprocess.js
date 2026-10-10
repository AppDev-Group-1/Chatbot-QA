// OWNER: Member D | Text cleaning
// TODO: lowercase, strip punctuation/symbols, collapse whitespace, trim
export function preprocess(text) {
  let clean = String(text ?? "").toLowerCase();

  // 1. Replace hyphens with spaces (to handle "random-access")
  clean = clean.replace(/-/g, ' ');

  // 2. Remove punctuation/symbols and normalize whitespace
  clean = clean.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();

  // 3. Remove stopwords (handles long sentences like "It is the brain of the computer")
  const stopwords = [
    "it", "is", "the", "a", "an", "of", "in", "on", "to", "and", "or", "that", "this", "are", "was", "were", "for", "with", "as",
    // NEW GENERIC WORDS TO IGNORE:
    "unit", "system", "device", "component", "hardware", "general", "purpose", "runs", "repeatedly"
  ];
  let words = clean.split(" ").filter(w => w && !stopwords.includes(w));
  clean = words.join(" ");

  // 4. Acronym Expansion (Crucial for Levenshtein to match abbreviations)
  const acronyms = {
    // CPU
    "cpu": "central processing unit",
    "processor": "central processing unit",

    // Motherboard
    "mobo": "motherboard",
    "mb": "motherboard",
    "mainboard": "motherboard",

    // RAM
    "ram": "random access memory",

    // Storage Drive
    "ssd": "solid state drive",
    "hdd": "hard disk drive",
    "hard drive": "storage drive",
    "solid state": "storage drive",

    // PSU
    "psu": "power supply unit",
    "power supply": "power supply unit",

    // GPU
    "gpu": "graphics processing unit",
    "graphics card": "graphics processing unit",
    "video card": "graphics processing unit",

    // Computer Case
    "chassis": "computer case",
    "tower": "computer case",

    // Cooling System
    "cooler": "cooling system",
    "fan": "cooling system",
    "heatsink": "cooling system",

    // Monitor
    "screen": "monitor",
    "display": "monitor",
    "vdu": "monitor",

    // Keyboard
    "kb": "keyboard",

    // Mouse
    "pointer": "mouse"
  };
  for (const [key, value] of Object.entries(acronyms)) {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    clean = clean.replace(regex, value);
  }

  return clean.trim();
}

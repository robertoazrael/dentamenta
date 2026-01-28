# GEMINI.md — DentaMenta repo rules

## Project intent
This repository contains the DentaMenta marketing site (demo for Mentemática).
Primary goals: extremely fast, clean UI, minimal JS, high conversion.

## Stack
- Astro (latest stable)
- Tailwind CSS (via build pipeline, NOT CDN)
- Vanilla JS only where necessary (no React/Vue/Svelte)
- Icons: lucide-astro (NO lucide runtime script)

## Design guardrails
- Preserve the current approved prototype UI and copy from prototipo.html.
- Keep section order and section IDs (#hero, #servicios, #ofertas, #acerca, #staff, #contacto).
- Keep the mint palette and typography (Plus Jakarta Sans).
- Do not “redesign” unless explicitly requested.

## Tailwind theme
Use these tokens exactly:
- mint:
  - 50:  #E6F7F3
  - 100: #D1EFED
  - 300: #A7E4D4
  - 500: #6FD3C6
  - 600: #5CB9AD
- accent: #2BB0A6
- ice:    #F6F8F9
- soft:   #5F6F73
- dark:   #1F2D2E

## Dark mode
- Dark mode uses the `dark` class on `<html>`.
- Persist with localStorage.theme ('dark' or 'light').

## Coding rules
- Prefer semantic HTML and accessibility (labels, aria, focus states).
- Avoid heavy JS. Keep behavior identical to prototype.
- Split into Astro components in src/components and assemble in src/pages/index.astro.
- Keep CSS minimal; use Tailwind. Put only the prototype-specific CSS (glass, faq transitions) in src/styles/global.css.

## Do not do
- Do not delete prototipo.html.
- Do not add new dependencies unless required for Astro/Tailwind/lucide-astro.
- Do not change images or copy unless asked.

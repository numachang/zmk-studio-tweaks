# Hero-page screenshots

Drop PNGs at the filenames below. `HeroPage.tsx` references them by URL,
so anything in this folder is served at `/screenshots/<filename>` and a
plain file replace is enough — no rebuild step beyond the usual
`npm run build`.

| Filename                | What the screenshot should show |
| ----------------------- | ------------------------------- |
| `fullscreen.png`        | Hero overview: a real keymap mid-edit, with the layer list, the physical keyboard view, and the picker all on one screen. |
| `picker-physical.png`   | The HID usage picker rendered as a physical keyboard layout (ANSI / ISO / JIS), one key selected. |
| `picker-search.png`     | The picker with text typed in the cross-tab search bar, results filtered across categories. |
| `picker-chips.png`      | The chip-grid behavior selector alongside the visual layer picker. |
| `export.png`            | Full-app shot taken at the moment an Export toast appears (kept as source — the hero crops `io-*` from this). |
| `import.png`            | Full-app shot taken at the moment an Import toast appears (kept as source — the hero crops `io-*` from this). |
| `io-buttons.png`        | Cropped strip of the header showing the Download / Upload (Export / Import) buttons. Cropped from `import.png`. |
| `io-export-toast.png`   | Cropped Export toast only ("Exported N layers to ..."). Cropped from `export.png`. |
| `io-import-toast.png`   | Cropped Import toast only ("Updated N bindings ... Press Save to keep them after restart..."). Cropped from `import.png`. |
| `layout-jis.png`        | Picker ISO/JIS tab rendered as the JIS 60% shape (¥, `\_`, 無変換, 変換, かな in their real positions) with JIS host labels. |
| `layout-ko.png`         | Picker ISO/JIS tab rendered as the Korean ANSI shape (한자 / 한/영 flanking Space) with Hangul jamo printed on every letter key. |
| `layout-fr.png`         | Picker Basic tab with French AZERTY host labels (Q↔A swap, accented number row). |
| `layout-de.png`         | Picker Basic tab with German QWERTZ host labels (Y↔Z swap, ß, Ü, Ö, Ä). |

The `io-*` files are tight crops of `export.png` / `import.png` and are
what the hero page actually displays. If you re-shoot the full-app
screenshots, regenerate the `io-*` crops too (any image editor; or use
Pillow / ImageMagick to script it).

Suggested format:

- **PNG**, ~16:10 aspect ratio (the card slot is `aspect-[16/10]`).
- 2x device pixel ratio for sharp rendering on HiDPI displays
  (≈ 1600x1000 source resolution).
- No browser chrome — crop to the Studio UI.
- Either theme works, but using a consistent theme across all four
  reads as more deliberate.

If a file is missing the card renders a "Screenshot pending" placeholder,
so the page won't break while you're still capturing.

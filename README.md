# zmk-studio-tweaks

A community fork of [zmk-studio](https://github.com/zmkfirmware/zmk-studio).
Adds keymap import/export and a visual key picker on top of upstream; a host-layout localization
tweak is still planned.

> ⚠️ **Personal fork / Work in progress** — see the status table below for what's actually shipped.
> This repo exists to track ideas, experiment, and (where possible) feed changes back upstream.
> It is **not** a replacement for upstream ZMK Studio.

## Try it

A live build of the current `main` is hosted at **<https://zmk-studio-tweaks.numachang.com/>**.

It runs entirely in the browser and talks to keyboards over the **Web Serial API**, so it only
works in Chromium-based browsers (Chrome, Edge, Brave, …) on a machine where you can plug the
keyboard in over USB. No data leaves your machine — the page is a static SPA hosted on
Cloudflare and the keyboard connection is local.

## Based on

This project is a fork of **[zmkfirmware/zmk-studio](https://github.com/zmkfirmware/zmk-studio)**,
the official keymap editor for [ZMK Firmware](https://zmk.dev/). All credit for the underlying
application, design, and protocol work belongs to the upstream maintainers and contributors.

This fork is maintained independently and is **not affiliated with or endorsed by** the ZMK project.

## Why this fork exists

A handful of features would make day-to-day use a little smoother for me personally.
Some of these are already being discussed in upstream issues/PRs; this fork is a place to
prototype them without blocking on upstream review cycles. Where a feature lands cleanly,
the intent is to send it back upstream as a PR.

## Tweaks

| # | Feature | Status | Related upstream |
| - | ------- | ------ | ---------------- |
| 1 | **Keymap import/export** — round-trip a keymap as a JSON file | ✅ Shipped | [PR #171](https://github.com/zmkfirmware/zmk-studio/pull/171), [issue #166](https://github.com/zmkfirmware/zmk-studio/issues/166) |
| 2 | **Visual key picker** — grid-style HID usage picker with cross-tab search, physical-keyboard layouts, and a chip-grid behavior selector | ✅ Shipped | [PR #159](https://github.com/zmkfirmware/zmk-studio/pull/159) |
| 3 | **Host-layout localization** — choose how the host OS interprets keys (e.g. JIS / Japanese) | 🛠️ Planned | — |

The shipped tweaks live on `main` and are served from the [Try it](#try-it) link above.
See `CLAUDE.md` for the working stance behind these choices.

### What's actually changed vs. upstream

- **Import / export buttons in the app header** — round-trip a keymap as a JSON file, with a
  toast-based feedback system that surfaces firmware rejections instead of failing silently.
- **Grid-style HID usage picker** — adapted from upstream [PR #159](https://github.com/zmkfirmware/zmk-studio/pull/159),
  with an added cross-tab search bar so you can type to filter across every keycode category at once.
- **Physical-keyboard layouts in the picker** — pick a keycode by clicking the corresponding key on
  a rendered ANSI / ISO / JIS layout, instead of hunting through alphabetised lists.
- **Chip-grid behavior selector** — the behavior chooser is grouped by tier and category instead of
  a flat dropdown.
- **Visual layer picker** — pick a target layer from a small layer-list panel instead of by index.
- **Polished key preview** — long labels are fit to the key, and undo / setLayerBinding rejections
  from the firmware are surfaced via toasts instead of being swallowed.

## Getting started (development)

The build setup is the same as upstream — see [zmk-studio's own README](https://github.com/zmkfirmware/zmk-studio#readme) for the canonical instructions.

```bash
npm install
npm run dev          # web build (Chromium-only, see note above)
npm run build        # static SPA → dist/ (what Cloudflare serves)
npm run tauri dev    # native desktop build via Tauri
```

The hosted [Try it](#try-it) site is just `npm run build` deployed as static assets on
Cloudflare; there is no backend to run.

## Related upstream projects

- [`zmkfirmware/zmk-studio-ts-client`](https://github.com/zmkfirmware/zmk-studio-ts-client) — the TypeScript RPC client this app depends on.
- [`zmkfirmware/zmk-studio-messages`](https://github.com/zmkfirmware/zmk-studio-messages) — the protobuf message definitions shared with ZMK firmware.
- [`zmkfirmware/zmk`](https://github.com/zmkfirmware/zmk) — the ZMK firmware itself, which hosts the Studio RPC server.

## License

Distributed under the **Apache License 2.0**, the same license as upstream. See [`LICENSE`](LICENSE)
and [`NOTICE`](NOTICE) for the full text and required attribution. Modifications in this fork are
also released under Apache 2.0.

## Acknowledgments

Huge thanks to the ZMK project maintainers and the wider ZMK community for building and
freely sharing the firmware, the Studio app, and the surrounding ecosystem. This fork would
not exist without their work.

## Disclaimer

This is a personal fork with no warranty, no support guarantee, and no roadmap commitments.
If you need a stable, supported Studio, use the official one at
[zmkfirmware/zmk-studio](https://github.com/zmkfirmware/zmk-studio).

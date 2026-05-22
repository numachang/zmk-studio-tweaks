# zmk-studio-tweaks

A community fork of [zmk-studio](https://github.com/zmkfirmware/zmk-studio).
Planned tweaks: keymap import/export, type-to-search key picker, and host-layout localization.

> ⚠️ **Personal fork / Work in progress** — none of the tweaks below are implemented yet.
> This repo exists to track ideas, experiment, and (where possible) feed changes back upstream.
> It is **not** a replacement for upstream ZMK Studio.

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

## Planned tweaks

| # | Feature | Status | Related upstream |
| - | ------- | ------ | ---------------- |
| 1 | **Keymap import/export** — round-trip a keymap as a JSON file | Planned | [PR #171](https://github.com/zmkfirmware/zmk-studio/pull/171), [issue #166](https://github.com/zmkfirmware/zmk-studio/issues/166) |
| 2 | **Type-to-search key picker** — replace dropdown navigation with incremental search | Planned | [PR #159](https://github.com/zmkfirmware/zmk-studio/pull/159) |
| 3 | **Host-layout localization** — choose how the host OS interprets keys (e.g. JIS / Japanese) | Planned | — |

Roadmap only — nothing is shipped yet. See `CLAUDE.md` for the working stance behind these choices.

## Getting started (development)

The build setup is the same as upstream — see [zmk-studio's own README](https://github.com/zmkfirmware/zmk-studio#readme) for the canonical instructions.

```bash
npm install
npm run dev
```

The web build talks to keyboards over the **Web Serial API**, which is only available in
Chromium-based browsers (Chrome, Edge, Brave, …). A native build is also available via Tauri:

```bash
npm run tauri dev
```

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

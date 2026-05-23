# CLAUDE.md

このファイルは、Claude Code がこのリポジトリで作業するときの方針を定めるものです。人間の読者（≒将来の自分）も読む前提で書いています。

---

## このプロジェクトの性格

- **個人用フォーク (personal fork)** です。商業化はしません。
- サポート・SLA・長期メンテの保証はありません。
- 上流 [zmkfirmware/zmk-studio](https://github.com/zmkfirmware/zmk-studio) の代替ではなく、上流に「足りないと感じた小さな機能」を私的に試す場です。

## コミュニティへの敬意（最重要）

このフォークは、ZMK プロジェクトの善意の上に成り立っています。次のことを必ず守ってください。

- **クレジットを残す**: README / コミットメッセージ / PR 説明で、上流 (`zmkfirmware/zmk-studio`, Apache-2.0) への謝意とリンクを明示する。
- **上流をネガティブに書かない**: 「公式が遅いから」「メンテナが対応しないから」といったニュアンスは避ける。フォークの動機は「個人的な使い勝手の追求」として記述する。
- **upstream に還元する姿勢を保つ**: 機能ができたら upstream にも PR を投げる。取り込まれなくても、投げたという事実が大事。
- **関連プロジェクトのライセンスと規約を尊重**: [`zmk-studio-ts-client`](https://github.com/zmkfirmware/zmk-studio-ts-client) と [`zmk-studio-messages`](https://github.com/zmkfirmware/zmk-studio-messages) も同様。
- **囲い込みにしない**: フォークでの改造は常に公開する。private にして抱え込まない。

## 開発スタンス

### 最小限主義

不満を解消する**最小限**の改修にとどめます。

- 大規模リファクタや独自路線の追求はしない。
- 既存の `src/` ディレクトリ構造（`keyboard/`, `behaviors/`, `rpc/`, `tauri/` ほか）を尊重する。
- 「ついでにこれも直す」と差分を膨らませない。1 PR / 1 機能。

### upstream 追従

- `upstream` remote: `https://github.com/zmkfirmware/zmk-studio.git`
- 定期的に `git fetch upstream` して、`main` に rebase で取り込む（merge ではなく rebase 推奨。履歴を直線に保つ）。
- 上流の `main` が動いた直後は、こちらの作業ブランチも早めに rebase する。

### 上流 PR の取り込み積極性

特に下記の open PR / issue は、Planned tweaks と直結しているので状況を観察すること。

- [PR #171](https://github.com/zmkfirmware/zmk-studio/pull/171) — keymap import/export（Planned ① と直結）
- [PR #159](https://github.com/zmkfirmware/zmk-studio/pull/159) — Grid Picker for HID Usage（Planned ② と関連）
- [issue #166](https://github.com/zmkfirmware/zmk-studio/issues/166) — Import keymap file
- [issue #168](https://github.com/zmkfirmware/zmk-studio/issues/168) — Mouse Emulation Support
- [issue #169](https://github.com/zmkfirmware/zmk-studio/issues/169) — Tog-Tap Mo-Hold Support

近い実装が upstream にあれば、ゼロから書かずに参考にする / 取り込む。

## 作業時のルール

### 不可逆な操作の前は必ず確認

- `git push`, deploy, リポジトリ設定変更, force push, ブランチ削除 などは、実行前にユーザに一声かける。
- 「許可済み」と勝手に拡大解釈しない。スコープ外の操作は毎回確認。

### ブランチ運用

- `main` への直 push は避ける。機能ブランチを切る: `feature/<name>` または `chore/<name>`。
- PR ベースで `main` に入れる（self-merge でも PR を経由）。
- **clone 後に一度だけ** `gh repo set-default numachang/zmk-studio-tweaks` を実行する。`gh pr create` は何も指定しないと **upstream を base に取りに行く**（過去 2 回、誤って `zmkfirmware/zmk-studio` に PR が立った）。set-default はローカル `.git/config` のみ書き換え、push されない。

### コミット

- メッセージは upstream のスタイル（Conventional Commits 風: `feat:`, `fix:`, `ci:`, `chore:`, `refactor:`, `docs:` 等）に合わせる。
- すべての Claude による commit には `Co-Authored-By: Claude <noreply@anthropic.com>` を含める。
- `.env` や認証情報、巨大なバイナリを誤って add しない（`git add -A` / `git add .` は避け、ファイル指定で add する）。

### ライセンス遵守

- 上流は **Apache License 2.0**。MIT ではない。
- 改変ファイルには Apache 2.0 §4(b) に従い、変更があった旨を残す（ファイル先頭の copyright 注記など）。
- `NOTICE` ファイルは派生物にも保持する義務がある。削除・改竄しない。
- 新規ファイル冒頭に独自の copyright を追加するのは OK だが、Apache 2.0 のままにする。

## スタック（参考）

- **フロント**: React 18 + TypeScript 5 + Vite 5 + Tailwind CSS 3 + react-aria-components
- **デスクトップ版**: Tauri 2 (Rust) — `src-tauri/`、`bluest` で BLE GATT、`tokio-serial` でシリアル
- **RPC クライアント**: [`@zmkfirmware/zmk-studio-ts-client`](https://github.com/zmkfirmware/zmk-studio-ts-client)
- **メッセージ定義**: [`zmkfirmware/zmk-studio-messages`](https://github.com/zmkfirmware/zmk-studio-messages)（protobuf v3）
- **HID テーブル**: `src/HidUsageTables-1.5.json` 等の静的 JSON
- **firmware 側 RPC サーバ**: [`zmkfirmware/zmk`](https://github.com/zmkfirmware/zmk) の `app/src/studio/`（C/Zephyr、USB UART と BLE GATT の 2 トランスポート）

## デプロイ

- 静的 SPA を **Cloudflare Pages** に公開予定（`npm run build` → `dist/`）。
- GitHub `main` への push でビルド & デプロイ自動化（未設定）。
- Web Serial API のため、配布先のブラウザは Chromium 系限定であることを明示する。

## 起動コマンド早見

```bash
npm install
npm run dev            # Web 版（要 Chromium 系）
npm run tauri dev      # デスクトップ版
npm run build          # 静的ビルド → dist/
npm run lint
```

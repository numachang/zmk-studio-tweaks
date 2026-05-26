import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";

import { ExternalLink } from "./misc/ExternalLink";
import { useModalRef } from "./misc/useModalRef";

export interface HeroPageProps {
  onConnect: () => void;
  hasTransports: boolean;
}

interface FeatureImage {
  src: string;
  alt: string;
  /**
   * Short label shown as a corner badge on the thumbnail and as the
   * title above the lightbox image (e.g. "JIS", "Korean"). When set,
   * the thumbnail becomes click-to-zoom.
   */
  label?: string;
}

interface Feature {
  title: string;
  body: string;
  images: FeatureImage[];
  /**
   * When set, lay images out in a 2-column grid instead of the default
   * stacked / single-image layout. Useful for "compare N similar shots"
   * features (the host-layout row's 2x2 grid of language variants).
   */
  gridCols?: 2;
}

const FEATURES: Feature[] = [
  {
    title: "Pick keys on the keyboard you actually use",
    body: "Click a key on a rendered ANSI / ISO / JIS layout instead of hunting through alphabetised lists. The grid mirrors a real keyboard so muscle memory translates to mouse clicks.",
    images: [
      {
        src: "/screenshots/picker-physical.png",
        alt: "Screenshot of the HID usage picker rendered as a physical keyboard layout",
      },
    ],
  },
  {
    title: "Type to find anything, across every category",
    body: "A single search bar filters the entire keycode picker at once. Vol, Esc, Bspc, F11 — all reachable in two keystrokes, without first guessing which tab they live under.",
    images: [
      {
        src: "/screenshots/picker-search.png",
        alt: "Screenshot of the picker's cross-tab search bar filtering keycodes",
      },
    ],
  },
  {
    title: "Behaviors and layers as a visual grid, not a dropdown",
    body: "The behavior chooser is grouped by tier and category as a chip grid. Multi-parameter behaviors like Layer-Tap surface Hold / Tap as sub-tabs, and layer targets pick from a labelled list instead of an opaque index.",
    images: [
      {
        src: "/screenshots/picker-chips.png",
        alt: "Screenshot of the chip-grid behavior selector with Layer-Tap selected and the visual layer picker",
      },
    ],
  },
  {
    title: "Round-trip your keymap as a file",
    body: "Download and Upload sit in the app header. Download writes the live keymap as a .keymap file. Edit it offline, then Upload it back — the firmware reports exactly what changed and what was already there, with a reminder to Save so the changes survive a restart.",
    images: [
      {
        src: "/screenshots/io-buttons.png",
        alt: "Header showing the Download and Upload buttons on the right side",
      },
      {
        src: "/screenshots/io-export-toast.png",
        alt: "Toast: Exported 4 layers to Cornix-2026-05-25T11-06-52.keymap",
      },
      {
        src: "/screenshots/io-import-toast.png",
        alt: "Toast: Updated 4 bindings from Cornix-2026-05-25T11-04-23.keymap (196 already matched). Changes are live on the device. Press Save to keep them after restart, or Discard to revert.",
      },
    ],
  },
  {
    title: "Speak your keyboard's language",
    body: "Pick the host OS keyboard layout you actually use — 22 layouts ship today, from US ANSI to JIS, Korean, German QWERTZ, French AZERTY and a dozen more — and labels in the picker and on the keymap retrace what the host will type. The HID code on the device stays the same; only the display follows the layout. The ISO/JIS tab also switches its physical shape per host: ¥ and 変換/無変換/かな in their real positions on JIS, 한자/한/영 flanking Space on Korean, NUHS/NUBS on European ISO.",
    gridCols: 2,
    images: [
      {
        src: "/screenshots/layout-jis.png",
        alt: "Picker's ISO/JIS tab rendered as a JIS 60% layout, with 全/半, ¥, 無変換, 変換 and かな in their physical positions",
        label: "日本語 · JIS",
      },
      {
        src: "/screenshots/layout-ko.png",
        alt: "Picker's ISO/JIS tab rendered as a Korean ANSI shape with 한자 and 한/영 flanking Space, and Hangul jamo (ㅁ / ㅂ / ㅓ etc.) printed on every letter key",
        label: "한국어 · Korean",
      },
      {
        src: "/screenshots/layout-fr.png",
        alt: "Picker's Basic tab with French AZERTY host labels — Q and A swapped, W and Z swapped, accented number row",
        label: "Français · AZERTY",
      },
      {
        src: "/screenshots/layout-de.png",
        alt: "Picker's Basic tab with German QWERTZ host labels — Y and Z swapped, ß on the minus key, umlauts on the home row",
        label: "Deutsch · QWERTZ",
      },
    ],
  },
];

export const HeroPage = ({ onConnect, hasTransports }: HeroPageProps) => {
  const [expanded, setExpanded] = useState<FeatureImage | null>(null);
  const openImage = useCallback((image: FeatureImage) => {
    if (image.label) setExpanded(image);
  }, []);
  const closeImage = useCallback(() => setExpanded(null), []);

  return (
    <div className="overflow-y-auto h-full w-full">
      <ImageLightbox image={expanded} onClose={closeImage} />
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col gap-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <img src="/zmk.svg" alt="ZMK logo" className="h-12" />
              <h1 className="text-4xl font-semibold tracking-tight">
                zmk-studio-tweaks
              </h1>
            </div>

            <p className="text-lg text-base-content/80">
              A community fork of ZMK Studio with a visual key picker, keymap
              import / export, and a few extras for daily editing.
            </p>

            <div className="flex flex-col items-start gap-2">
              <button
                type="button"
                onClick={onConnect}
                disabled={!hasTransports}
                className="bg-primary text-primary-content px-6 py-3 rounded-lg text-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect a keyboard
              </button>
              {hasTransports ? (
                <p className="text-sm text-base-content/60">
                  Uses the Web Serial API — no data leaves your machine.
                </p>
              ) : (
                <p className="text-sm text-base-content/60 max-w-md">
                  Your browser doesn't expose Web Serial. Open this page in a
                  Chromium-based browser (Chrome, Edge, Brave, …) on a desktop
                  OS, or grab the{" "}
                  <a
                    href="/download"
                    className="text-primary hover:underline"
                  >
                    desktop build
                  </a>
                  .
                </p>
              )}
            </div>

            <p className="text-sm text-base-content/70 pt-4 border-t border-base-300 mt-2">
              Built on top of{" "}
              <ExternalLink href="https://github.com/zmkfirmware/zmk-studio">
                zmkfirmware/zmk-studio
              </ExternalLink>{" "}
              (Apache-2.0). All credit for the underlying application, design,
              and protocol work belongs to the upstream maintainers and the
              wider ZMK community — this fork would not exist without their
              work. It is{" "}
              <strong>not affiliated with or endorsed by</strong> the ZMK
              project and is not a replacement for upstream ZMK Studio.
            </p>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <div className="rounded-lg border border-base-300 bg-base-200 overflow-hidden shadow-lg">
              <img
                src="/screenshots/fullscreen.png"
                alt="Screenshot of zmk-studio-tweaks editing a Cornix keymap, with the layer list, the physical keyboard view, and the visual key picker all on one screen"
                className="max-h-[480px] w-auto h-auto block"
              />
            </div>
            <p className="text-center text-sm text-base-content/60 max-w-md">
              Editing a Cornix keymap — layer list, physical layout, and the
              picker on one screen.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-12">
          <h2 className="text-2xl font-semibold text-center">
            What this fork adds
          </h2>

          {FEATURES.map((feature, i) => (
            <FeatureRow
              key={feature.title}
              feature={feature}
              flip={i % 2 === 1}
              onImageClick={openImage}
            />
          ))}
        </section>

        <section className="flex flex-col gap-3 text-sm text-base-content/70 border-t border-base-300 pt-6">
          <p>
            <strong>Personal fork.</strong> No warranty, no support guarantee,
            no roadmap commitments. If you need a stable, supported Studio,
            use the official one at{" "}
            <ExternalLink href="https://github.com/zmkfirmware/zmk-studio">
              zmkfirmware/zmk-studio
            </ExternalLink>
            .
          </p>
          <p>
            Source for this fork:{" "}
            <ExternalLink href="https://github.com/numachang/zmk-studio-tweaks">
              numachang/zmk-studio-tweaks
            </ExternalLink>
            . ZMK firmware:{" "}
            <ExternalLink href="https://zmk.dev/">zmk.dev</ExternalLink>.
          </p>
        </section>
      </div>
    </div>
  );
};

interface FeatureRowProps {
  feature: Feature;
  flip: boolean;
  onImageClick: (image: FeatureImage) => void;
}

const FeatureRow = ({ feature, flip, onImageClick }: FeatureRowProps) => {
  const grid = feature.gridCols === 2;
  const stack = !grid && feature.images.length > 1;
  const single = !grid && feature.images.length === 1;
  const wrapperClass = grid
    ? "w-full grid grid-cols-2 gap-3"
    : `w-full flex flex-col ${stack ? "gap-3" : "gap-2"}`;
  const baseFrame = "rounded-lg border border-base-300 bg-base-200 overflow-hidden";
  const cellFrame = single
    ? `aspect-[16/10] ${baseFrame} flex items-center justify-center`
    : baseFrame;
  const imgClass = single
    ? "w-full h-full object-contain"
    : "w-full h-auto block";
  const renderImage = (image: FeatureImage, expandable: boolean) => (
    <>
      <div className="relative w-full bg-base-200 overflow-hidden">
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className={imgClass}
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = "none";
            const fallback = img.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        <div
          className={`${
            single ? "w-full h-full" : "py-8"
          } items-center justify-center text-sm text-base-content/60 px-4 text-center`}
          style={{ display: "none" }}
        >
          Screenshot pending — drop a PNG at{" "}
          <code className="mx-1">{image.src}</code>
        </div>
      </div>
      {expandable && image.label && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-base-300 bg-base-100">
          <span className="text-sm font-semibold text-base-content truncate">
            {image.label}
          </span>
          <Maximize2
            aria-hidden
            className="w-4 h-4 text-base-content/40 group-hover:text-primary transition-colors duration-200 shrink-0"
          />
        </div>
      )}
    </>
  );

  const imageBlock = (
    <div className="md:w-1/2 flex items-center justify-center">
      <div className={wrapperClass}>
        {feature.images.map((image) => {
          const expandable = Boolean(image.label);
          if (expandable) {
            return (
              <button
                key={image.src}
                type="button"
                onClick={() => onImageClick(image)}
                aria-label={`Enlarge: ${image.label}`}
                className={`${baseFrame} group cursor-zoom-in transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:-translate-y-0.5 text-left p-0 flex flex-col`}
              >
                {renderImage(image, true)}
              </button>
            );
          }
          return (
            <div key={image.src} className={cellFrame}>
              {renderImage(image, false)}
            </div>
          );
        })}
      </div>
    </div>
  );

  const textBlock = (
    <div className="md:w-1/2 flex flex-col justify-center gap-2">
      <h3 className="text-xl font-semibold">{feature.title}</h3>
      <p className="text-base-content/80">{feature.body}</p>
    </div>
  );

  return (
    <div
      className={`flex flex-col gap-6 md:gap-10 ${
        flip ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      {imageBlock}
      {textBlock}
    </div>
  );
};

interface ImageLightboxProps {
  image: FeatureImage | null;
  onClose: () => void;
}

const ImageLightbox = ({ image, onClose }: ImageLightboxProps) => {
  const open = image !== null;
  const dialogRef = useModalRef(open, true, true);
  const lastImageRef = useRef<FeatureImage | null>(null);
  if (image) lastImageRef.current = image;

  // Wire the dialog's native `close` event (Escape key, outside click via
  // useModalRef, or the X button) back to our React `open` state so the
  // lightbox actually disappears.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handle = () => onClose();
    el.addEventListener("close", handle);
    return () => el.removeEventListener("close", handle);
  }, [dialogRef, onClose]);

  // Render last shown image during the close animation so the dialog
  // doesn't pop empty before unmounting.
  const shown = image ?? lastImageRef.current;

  return (
    <dialog
      ref={dialogRef}
      aria-label={shown?.label ? `${shown.label} screenshot` : "Screenshot"}
      className="p-0 bg-transparent backdrop:bg-black/70 backdrop:backdrop-blur-sm max-w-[95vw] max-h-[95vh] rounded-xl"
    >
      {shown && (
        <div className="relative flex flex-col gap-3 p-4 bg-base-100 rounded-xl shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            {shown.label && (
              <span className="px-3 py-1 rounded-md bg-primary/15 text-primary text-sm font-semibold">
                {shown.label}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="ml-auto p-1.5 rounded-md hover:bg-base-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <img
            src={shown.src}
            alt={shown.alt}
            className="block max-w-[90vw] max-h-[78vh] w-auto h-auto object-contain rounded-md"
          />
          <p className="text-xs text-base-content/60 max-w-[90vw]">{shown.alt}</p>
        </div>
      )}
    </dialog>
  );
};

import { ExternalLink } from "./misc/ExternalLink";

export interface HeroPageProps {
  onConnect: () => void;
  hasTransports: boolean;
}

interface Feature {
  title: string;
  body: string;
  images: { src: string; alt: string }[];
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
];

export const HeroPage = ({ onConnect, hasTransports }: HeroPageProps) => {
  return (
    <div className="overflow-y-auto h-full w-full">
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
            <FeatureRow key={feature.title} feature={feature} flip={i % 2 === 1} />
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
}

const FeatureRow = ({ feature, flip }: FeatureRowProps) => {
  const stack = feature.images.length > 1;
  const imageBlock = (
    <div className="md:w-1/2 flex items-center justify-center">
      <div className={`w-full flex flex-col ${stack ? "gap-3" : "gap-2"}`}>
        {feature.images.map((image) => (
          <div
            key={image.src}
            className={
              stack
                ? "rounded-lg border border-base-300 bg-base-200 overflow-hidden"
                : "aspect-[16/10] rounded-lg border border-base-300 bg-base-200 overflow-hidden flex items-center justify-center"
            }
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className={
                stack ? "w-full h-auto block" : "w-full h-full object-contain"
              }
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = "none";
                const fallback = img.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div
              className={`${
                stack ? "py-8" : "w-full h-full"
              } items-center justify-center text-sm text-base-content/60 px-4 text-center`}
              style={{ display: "none" }}
            >
              Screenshot pending — drop a PNG at{" "}
              <code className="mx-1">{image.src}</code>
            </div>
          </div>
        ))}
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

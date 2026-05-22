import { AppHeader } from "./AppHeader";

import { create_rpc_connection } from "@zmkfirmware/zmk-studio-ts-client";
import { call_rpc } from "./rpc/logging";

import type { Notification } from "@zmkfirmware/zmk-studio-ts-client/studio";
import { ConnectionState, ConnectionContext } from "./rpc/ConnectionContext";
import { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import {
  dtsRefForDisplayName,
  formatBindingParam,
  parseKeymapFile,
} from "./keymap-parser";
import { ConnectModal, TransportFactory } from "./ConnectModal";

import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import { connect as gatt_connect } from "@zmkfirmware/zmk-studio-ts-client/transport/gatt";
import { connect as serial_connect } from "@zmkfirmware/zmk-studio-ts-client/transport/serial";
import {
  connect as tauri_ble_connect,
  list_devices as ble_list_devices,
} from "./tauri/ble";
import {
  connect as tauri_serial_connect,
  list_devices as serial_list_devices,
} from "./tauri/serial";
import Keyboard from "./keyboard/Keyboard";
import { UndoRedoContext, useUndoRedo } from "./undoRedo";
import { usePub, useSub } from "./usePubSub";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";
import { LockStateContext } from "./rpc/LockStateContext";
import { UnlockModal } from "./UnlockModal";
import { valueAfter } from "./misc/async";
import { AppFooter } from "./AppFooter";
import { AboutModal } from "./AboutModal";
import { LicenseNoticeModal } from "./misc/LicenseNoticeModal";
import { ToastKind, useToast } from "./Toast";
import type { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: object;
  }
}

const TRANSPORTS: TransportFactory[] = [
  navigator.serial && { label: "USB", connect: serial_connect },
  ...(navigator.bluetooth && navigator.userAgent.indexOf("Linux") >= 0
    ? [{ label: "BLE", connect: gatt_connect }]
    : []),
  ...(window.__TAURI_INTERNALS__
    ? [
        {
          label: "BLE",
          isWireless: true,
          pick_and_connect: {
            connect: tauri_ble_connect,
            list: ble_list_devices,
          },
        },
      ]
    : []),
  ...(window.__TAURI_INTERNALS__
    ? [
        {
          label: "USB",
          pick_and_connect: {
            connect: tauri_serial_connect,
            list: serial_list_devices,
          },
        },
      ]
    : []),
].filter((t) => t !== undefined);

async function listen_for_notifications(
  notification_stream: ReadableStream<Notification>,
  signal: AbortSignal
): Promise<void> {
  const reader = notification_stream.getReader();
  const onAbort = () => {
    reader.cancel();
    reader.releaseLock();
  };
  signal.addEventListener("abort", onAbort, { once: true });
  do {
    const pub = usePub();

    try {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      console.log("Notification", value);
      pub("rpc_notification", value);

      const subsystem = Object.entries(value).find(
        ([_k, v]) => v !== undefined
      );
      if (!subsystem) {
        continue;
      }

      const [subId, subData] = subsystem;
      const event = Object.entries(subData).find(([_k, v]) => v !== undefined);

      if (!event) {
        continue;
      }

      const [eventName, eventData] = event;
      const topic = ["rpc_notification", subId, eventName].join(".");

      pub(topic, eventData);
    } catch (e) {
      signal.removeEventListener("abort", onAbort);
      reader.releaseLock();
      throw e;
    }
  } while (true);

  signal.removeEventListener("abort", onAbort);
  reader.releaseLock();
  notification_stream.cancel();
}

async function connect(
  transport: RpcTransport,
  setConn: Dispatch<ConnectionState>,
  setConnectedDeviceName: Dispatch<string | undefined>,
  signal: AbortSignal,
  notify: (kind: ToastKind, message: string) => void
) {
  const conn = await create_rpc_connection(transport, { signal });

  const details = await Promise.race([
    call_rpc(conn, { core: { getDeviceInfo: true } })
      .then((r) => r?.core?.getDeviceInfo)
      .catch((e) => {
        console.error("Failed first RPC call", e);
        return undefined;
      }),
    valueAfter(undefined, 1000),
  ]);

  if (!details) {
    notify("error", "Failed to connect to the chosen device");
    return;
  }

  listen_for_notifications(conn.notification_readable, signal)
    .then(() => {
      setConnectedDeviceName(undefined);
      setConn({ conn: null });
    })
    .catch((_e) => {
      setConnectedDeviceName(undefined);
      setConn({ conn: null });
    });

  setConnectedDeviceName(details.name);
  setConn({ conn });
}

function App() {
  const { notify } = useToast();
  const [conn, setConn] = useState<ConnectionState>({ conn: null });
  const [connectedDeviceName, setConnectedDeviceName] = useState<
    string | undefined
  >(undefined);
  const [doIt, undo, redo, canUndo, canRedo, reset] = useUndoRedo();
  const [showAbout, setShowAbout] = useState(false);
  const [showLicenseNotice, setShowLicenseNotice] = useState(false);
  const [connectionAbort, setConnectionAbort] = useState(new AbortController());

  const [lockState, setLockState] = useState<LockState>(
    LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED
  );

  useSub("rpc_notification.core.lockStateChanged", (ls) => {
    setLockState(ls);
  });

  useEffect(() => {
    if (!conn) {
      reset();
      setLockState(LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED);
    }

    async function updateLockState() {
      if (!conn.conn) {
        return;
      }

      const locked_resp = await call_rpc(conn.conn, {
        core: { getLockState: true },
      });

      setLockState(
        locked_resp.core?.getLockState ||
          LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED
      );
    }

    updateLockState();
  }, [conn, setLockState]);

  const save = useCallback(() => {
    async function doSave() {
      if (!conn.conn) {
        return;
      }

      notify("info", "Committing keymap to device flash…");
      const resp = await call_rpc(conn.conn, { keymap: { saveChanges: true } });
      if (!resp.keymap?.saveChanges || resp.keymap?.saveChanges.err) {
        console.error("Failed to save changes", resp.keymap?.saveChanges);
        notify(
          "error",
          `Save failed${resp.keymap?.saveChanges?.err ? `: ${resp.keymap.saveChanges.err}` : ""}`
        );
        return;
      }
      notify("success", "Keymap saved to flash. It will persist across restarts.");
    }

    doSave().catch((e) => {
      console.error("Save failed", e);
      notify("error", `Save failed: ${e instanceof Error ? e.message : String(e)}`);
    });
  }, [conn, notify]);

  const discard = useCallback(() => {
    async function doDiscard() {
      if (!conn.conn) {
        return;
      }

      const resp = await call_rpc(conn.conn, {
        keymap: { discardChanges: true },
      });
      if (!resp.keymap?.discardChanges) {
        console.error("Failed to discard changes", resp);
        notify("error", "Failed to discard changes");
        return;
      }

      reset();
      setConn({ conn: conn.conn });
      notify("info", "Reverted to last saved keymap.");
    }

    doDiscard().catch((e) => {
      console.error("Discard failed", e);
      notify(
        "error",
        `Discard failed: ${e instanceof Error ? e.message : String(e)}`
      );
    });
  }, [conn, notify]);

  const resetSettings = useCallback(() => {
    async function doReset() {
      if (!conn.conn) {
        return;
      }

      const resp = await call_rpc(conn.conn, {
        core: { resetSettings: true },
      });
      if (!resp.core?.resetSettings) {
        console.error("Failed to settings reset", resp);
      }

      reset();
      setConn({ conn: conn.conn });
    }

    doReset();
  }, [conn]);

  const disconnect = useCallback(() => {
    async function doDisconnect() {
      if (!conn.conn) {
        return;
      }

      await conn.conn.request_writable.close();
      connectionAbort.abort("User disconnected");
      setConnectionAbort(new AbortController());
    }

    doDisconnect();
  }, [conn]);

  const exportKeymap = useCallback(() => {
    async function doExport() {
      if (!conn.conn) {
        return;
      }

      const keymapResp = await call_rpc(conn.conn, { keymap: { getKeymap: true } });
      const keymap = keymapResp?.keymap?.getKeymap;
      if (!keymap) {
        console.error("Failed to fetch keymap for export", keymapResp);
        notify("error", "Failed to fetch keymap from device");
        return;
      }

      const behaviorList = await call_rpc(conn.conn, { behaviors: { listAllBehaviors: true } });
      const behaviorIds = behaviorList?.behaviors?.listAllBehaviors?.behaviors || [];

      const behaviors: Record<number, string> = {};
      for (const id of behaviorIds) {
        const details = await call_rpc(conn.conn, { behaviors: { getBehaviorDetails: { behaviorId: id } } });
        const d = details?.behaviors?.getBehaviorDetails;
        if (d) {
          behaviors[d.id] = d.displayName;
        }
      }

      let content = `#include <behaviors.dtsi>\n#include <dt-bindings/zmk/keys.h>\n\n/ {\n  keymap {\n    compatible = "zmk,keymap";\n\n`;

      for (const layer of keymap.layers) {
        const layerName = layer.name?.replace(/[^a-zA-Z0-9_]/g, "_") || `layer_${layer.id}`;
        content += `    ${layerName} {\n      bindings = <\n`;
        const bindingStrs = layer.bindings.map((b: { behaviorId: number; param1: number; param2: number }) => {
          const displayName = behaviors[b.behaviorId] ?? `unknown_${b.behaviorId}`;
          const ref = dtsRefForDisplayName(displayName);
          const parts = [`&${ref}`];
          if (b.param1 !== 0) parts.push(formatBindingParam(b.param1));
          if (b.param2 !== 0) parts.push(formatBindingParam(b.param2));
          return parts.join(" ");
        });
        const maxLen = Math.max(...bindingStrs.map((s: string) => s.length));
        const padded = bindingStrs.map((s: string) => s.padEnd(maxLen));
        content += padded.map((s: string) => `        ${s}`).join("\n") + "\n";
        content += `      >;\n    };\n\n`;
      }

      content += `  };\n};\n`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      a.href = url;
      a.download = `${connectedDeviceName || "zmk"}-${stamp}.keymap`;
      a.click();
      URL.revokeObjectURL(url);

      const layerCount = keymap.layers.length;
      notify(
        "success",
        `Exported ${layerCount} layer${layerCount === 1 ? "" : "s"} to ${a.download}`
      );
    }

    doExport().catch((e) => {
      console.error("Export failed", e);
      notify("error", `Export failed: ${e instanceof Error ? e.message : String(e)}`);
    });
  }, [conn, connectedDeviceName, notify]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const importKeymap = useCallback(() => {
    if (!conn.conn) return;
    fileInputRef.current?.click();
  }, [conn]);

  const handleFileImport = useCallback(() => {
    async function doImport(file: File) {
      if (!conn.conn) return;

      const text = await file.text();
      const parsedLayers = parseKeymapFile(text);
      if (parsedLayers.length === 0) {
        notify(
          "error",
          `No layers found in ${file.name}. Is this a ZMK .keymap file?`
        );
        return;
      }

      const keymapResp = await call_rpc(conn.conn, { keymap: { getKeymap: true } });
      const keymap = keymapResp?.keymap?.getKeymap;
      if (!keymap) {
        notify("error", "Failed to fetch current keymap from device");
        return;
      }

      const behaviorList = await call_rpc(conn.conn, { behaviors: { listAllBehaviors: true } });
      const behaviorIds = behaviorList?.behaviors?.listAllBehaviors?.behaviors || [];

      const behaviorNameToId: Record<string, number> = {};
      const behaviorDetailsById: Record<number, GetBehaviorDetailsResponse> = {};
      for (const id of behaviorIds) {
        const details = await call_rpc(conn.conn, { behaviors: { getBehaviorDetails: { behaviorId: id } } });
        const d = details?.behaviors?.getBehaviorDetails;
        if (d) {
          const name = d.displayName.replace(/^&/, "");
          behaviorNameToId[name.toLowerCase()] = d.id;
          behaviorNameToId[d.displayName.toLowerCase()] = d.id;
          // Also accept the DTS reference form (e.g. "kp" for "Key Press") so
          // that .keymap files can be imported using ZMK's standard syntax.
          behaviorNameToId[dtsRefForDisplayName(d.displayName).toLowerCase()] = d.id;
          behaviorDetailsById[d.id] = d;
        }
      }

      let updatedCount = 0;
      let unchangedCount = 0;
      let skippedCount = 0;
      let preservedCount = 0;
      let failedCount = 0;
      const unknownBehaviors = new Set<string>();
      const readOnlyBehaviors = new Set<string>();
      const failedBindings: Array<{
        layer: number;
        position: number;
        behavior: string;
        resp: unknown;
      }> = [];

      for (let li = 0; li < parsedLayers.length && li < keymap.layers.length; li++) {
        const parsedLayer = parsedLayers[li];
        const targetLayer = keymap.layers[li];

        for (let ki = 0; ki < parsedLayer.bindings.length && ki < targetLayer.bindings.length; ki++) {
          const parsedBinding = parsedLayer.bindings[ki];
          const behaviorName = parsedBinding.behavior.toLowerCase();

          const behaviorId = behaviorNameToId[behaviorName];
          if (behaviorId === undefined) {
            unknownBehaviors.add(parsedBinding.behavior);
            skippedCount++;
            continue;
          }

          const param1 = parsedBinding.params[0] || 0;
          const param2 = parsedBinding.params[1] || 0;

          // Skip the RPC entirely when the file's value matches the device's
          // current value. Sending setLayerBinding for a no-op still flips
          // the firmware's "unsaved changes" flag, which would leave Save
          // glowing as if there was something to persist when there isn't.
          const current = targetLayer.bindings[ki];
          if (
            current?.behaviorId === behaviorId &&
            current?.param1 === param1 &&
            current?.param2 === param2
          ) {
            unchangedCount++;
            continue;
          }

          const resp = await call_rpc(conn.conn, {
            keymap: {
              setLayerBinding: {
                layerId: targetLayer.id,
                keyPosition: ki,
                binding: { behaviorId, param1, param2 },
              },
            },
          });
          const code = resp.keymap?.setLayerBinding;
          if (code === 0 /* SET_LAYER_BINDING_RESP_OK */) {
            updatedCount++;
            continue;
          }

          // Firmware rejected the call. ZMK ships some behaviors with
          // `metadata: []` (e.g. ext_power, mouse_move, mouse_scroll on the
          // tested Cornix build) which means "no setLayerBinding parameter
          // shape is exposed via Studio". For those, treat the rejection as
          // an expected "preserved" outcome: the saved value matches the
          // file already, and there is no Studio API path to overwrite it.
          // Other rejections are real param-shape mismatches and should
          // surface to the user.
          const det = behaviorDetailsById[behaviorId];
          const isStudioReadOnly =
            !det?.metadata || det.metadata.length === 0;
          if (isStudioReadOnly) {
            readOnlyBehaviors.add(parsedBinding.behavior);
            preservedCount++;
            continue;
          }

          failedCount++;
          failedBindings.push({
            layer: li,
            position: ki,
            behavior: parsedBinding.behavior,
            resp: code,
          });
          console.warn(
            `[import] setLayerBinding FAILED layer=${li} pos=${ki} behavior='${parsedBinding.behavior}' (id=${behaviorId}) params=[${param1}, ${param2}] resp=${code}`,
            { metadata: det }
          );
        }
      }

      console.log(
        `[import] updated=${updatedCount} unchanged=${unchangedCount} preserved=${preservedCount} skipped=${skippedCount} failed=${failedCount}`
      );
      if (failedBindings.length > 0) {
        console.warn("[import] failed bindings:", failedBindings);
      }

      setConn({ conn: conn.conn });

      // setLayerBinding has already updated the device's live working keymap;
      // it just hasn't been committed to flash yet. Be explicit so the user
      // doesn't think the changes are unwritten.
      const persistReminder =
        "Changes are live on the device. Press Save to keep them after restart, or Discard to revert.";

      const unknownDetail =
        unknownBehaviors.size > 0
          ? ` Unknown behaviors: ${[...unknownBehaviors].slice(0, 5).join(", ")}${unknownBehaviors.size > 5 ? ", …" : ""}.`
          : "";
      const readOnlyDetail =
        readOnlyBehaviors.size > 0
          ? ` ${preservedCount} preserved (ZMK Studio can't edit ${[...readOnlyBehaviors].join(", ")}; original values kept).`
          : "";
      const failedDetail =
        failedCount > 0 ? ` Firmware rejected ${failedCount} (see console).` : "";

      if (
        updatedCount === 0 &&
        unchangedCount === 0 &&
        preservedCount === 0
      ) {
        notify(
          "error",
          `Import applied no bindings.${unknownDetail}${failedDetail}`
        );
      } else if (updatedCount === 0 && failedCount === 0 && skippedCount === 0) {
        // Everything in the file already matched the device — nothing to save.
        notify(
          "info",
          `${file.name} already matches the device. No changes needed.${readOnlyDetail}`
        );
      } else if (skippedCount > 0 || failedCount > 0) {
        notify(
          "warning",
          `Updated ${updatedCount} (${unchangedCount} already matched), skipped ${skippedCount}, rejected ${failedCount}.${unknownDetail}${readOnlyDetail}${failedDetail}`,
          { action: persistReminder }
        );
      } else {
        notify(
          "success",
          `Updated ${updatedCount} binding${updatedCount === 1 ? "" : "s"} from ${file.name} (${unchangedCount} already matched).${readOnlyDetail}`,
          { action: persistReminder }
        );
      }
    }

    const file = fileInputRef.current?.files?.[0];
    if (file) {
      doImport(file).catch((e) => {
        console.error("Import failed", e);
        notify("error", `Import failed: ${e instanceof Error ? e.message : String(e)}`);
      });
      fileInputRef.current!.value = "";
    }
  }, [conn, notify]);

  const onConnect = useCallback(
    (t: RpcTransport) => {
      const ac = new AbortController();
      setConnectionAbort(ac);
      connect(t, setConn, setConnectedDeviceName, ac.signal, notify);
    },
    [setConn, setConnectedDeviceName, notify]
  );

  return (
    <ConnectionContext.Provider value={conn}>
      <LockStateContext.Provider value={lockState}>
        <UndoRedoContext.Provider value={doIt}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".keymap"
            className="hidden"
            onChange={handleFileImport}
          />
          <UnlockModal />
          <ConnectModal
            open={!conn.conn}
            transports={TRANSPORTS}
            onTransportCreated={onConnect}
          />
          <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
          <LicenseNoticeModal
            open={showLicenseNotice}
            onClose={() => setShowLicenseNotice(false)}
          />
          <div className="bg-base-100 text-base-content h-full max-h-[100vh] w-full max-w-[100vw] inline-grid grid-cols-[auto] grid-rows-[auto_1fr_auto] overflow-hidden">
            <AppHeader
              connectedDeviceLabel={connectedDeviceName}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onSave={save}
              onDiscard={discard}
              onDisconnect={disconnect}
              onResetSettings={resetSettings}
              onExportKeymap={exportKeymap}
              onImportKeymap={importKeymap}
            />
            <Keyboard />
            <AppFooter
              onShowAbout={() => setShowAbout(true)}
              onShowLicenseNotice={() => setShowLicenseNotice(true)}
            />
          </div>
        </UndoRedoContext.Provider>
      </LockStateContext.Provider>
    </ConnectionContext.Provider>
  );
}

export default App;

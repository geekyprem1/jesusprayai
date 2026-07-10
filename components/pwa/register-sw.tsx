"use client";

import { useEffect } from "react";

/**
 * Registers the production service worker and applies updates promptly.
 * Dev mode is skipped so HMR is not interfered with.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((reg) => {
          // Check for updates periodically while the tab is open
          const id = window.setInterval(() => {
            void reg.update();
          }, 60 * 60 * 1000);

          reg.addEventListener("updatefound", () => {
            const worker = reg.installing;
            if (!worker) return;
            worker.addEventListener("statechange", () => {
              if (
                worker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New SW waiting — activate on next load; optional skipWaiting
                worker.postMessage("SKIP_WAITING");
              }
            });
          });

          return () => window.clearInterval(id);
        })
        .catch((err) => {
          console.warn("Service worker registration failed", err);
        });
    };

    // Register after load so first paint isn't competing
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      // Soft refresh once when new SW takes control
      // (avoid hard loops)
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    return () => {
      window.removeEventListener("load", onLoad);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  return null;
}

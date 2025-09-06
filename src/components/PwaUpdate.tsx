import { useEffect } from "react";
import { toast } from "sonner";

export const PwaUpdate = () => {
  useEffect(() => {
    const onUpdate = () => {
      toast("Update available", {
        description: "A new version is ready. Reload to update.",
        action: {
          label: "Update",
          onClick: () => {
            try {
              const w: ServiceWorker | undefined = (window as any).__SW_WAITING;
              if (w) {
                w.postMessage({ type: "SKIP_WAITING" });
                navigator.serviceWorker.addEventListener("controllerchange", () => {
                  window.location.reload();
                }, { once: true } as any);
              } else {
                window.location.reload();
              }
            } catch {
              window.location.reload();
            }
          },
        },
        duration: 15000,
      });
    };
    window.addEventListener("pwa-update-available", onUpdate as EventListener);
    return () => window.removeEventListener("pwa-update-available", onUpdate as EventListener);
  }, []);
  return null;
};


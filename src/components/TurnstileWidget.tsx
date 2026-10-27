import { useEffect, useRef, useState } from "react";

type TurnstileOptions = {
    sitekey: string;
    action: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
    "timeout-callback": () => void;
};

type TurnstileAPI = {
    render: (container: HTMLElement, options: TurnstileOptions) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId: string) => void;
};

declare global {
    interface Window {
        turnstile?: TurnstileAPI;
    }
}

const scriptId = "cloudflare-turnstile-api";
let scriptPromise: Promise<void> | undefined;

function loadTurnstileScript() {
    if (window.turnstile) {
        return Promise.resolve();
    }
    if (!scriptPromise) {
        scriptPromise = new Promise<void>((resolve, reject) => {
            let script = document.getElementById(scriptId) as HTMLScriptElement | null;
            if (script && !script.isConnected) {
                script = null;
            }
            if (!script) {
                script = document.createElement("script");
                script.id = scriptId;
                script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
                script.async = true;
                script.defer = true;
            }
            script.addEventListener("load", () => {
                if (window.turnstile) {
                    resolve();
                } else {
                    reject(new Error("Turnstile API did not initialize."));
                }
            }, { once: true });
            script.addEventListener("error", () => reject(new Error("Turnstile API failed to load.")), { once: true });
            if (!script.isConnected) {
                document.head.appendChild(script);
            }
        }).catch((error: unknown) => {
            const failedScript = document.getElementById(scriptId);
            failedScript?.remove();
            scriptPromise = undefined;
            throw error;
        });
    }
    return scriptPromise;
}

export function TurnstileWidget({
    siteKey,
    onToken,
}: {
    siteKey: string;
    onToken: (token: string) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | undefined>(undefined);
    const [status, setStatus] = useState<"loading" | "ready" | "expired" | "error">("loading");
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let disposed = false;
        widgetIdRef.current = undefined;
        if (!siteKey.trim()) {
            return;
        }

        void loadTurnstileScript()
            .then(() => {
                if (disposed || !containerRef.current || !window.turnstile) {
                    return;
                }
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    action: "owner_registration",
                    callback: (token) => {
                        onToken(token);
                        setStatus("ready");
                    },
                    "expired-callback": () => {
                        onToken("");
                        setStatus("expired");
                    },
                    "error-callback": () => {
                        onToken("");
                        setStatus("error");
                    },
                    "timeout-callback": () => {
                        onToken("");
                        setStatus("expired");
                    },
                });
            })
            .catch(() => {
                if (!disposed) {
                    onToken("");
                    setStatus("error");
                }
            });

        return () => {
            disposed = true;
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = undefined;
            }
        };
    }, [attempt, onToken, siteKey]);

    function retry() {
        onToken("");
        if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
            setStatus("loading");
            return;
        }
        if (!window.turnstile) {
            scriptPromise = undefined;
        }
        setStatus("loading");
        setAttempt((current) => current + 1);
    }

    const statusMessage = !siteKey.trim()
        ? "Security check is not configured. Registration is unavailable."
        : status === "expired"
            ? "The security check expired. Complete it again."
            : status === "error"
                ? "The security check could not be loaded. Please retry."
                : status === "loading"
                    ? "Loading security check..."
                    : "";

    return (
        <div className="turnstile-widget">
            <div ref={containerRef} />
            {statusMessage && <p role={status === "error" ? "alert" : "status"}>{statusMessage}</p>}
            {(status === "error" || status === "expired") && siteKey.trim() && (
                <button type="button" onClick={retry}>Retry security check</button>
            )}
        </div>
    );
}

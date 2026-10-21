import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import {
    clearCSRFToken,
    setCSRFToken,
    unauthorizedEvent,
} from "../services/api";
import {
    getAuthErrorMessage,
    getCurrentUser,
    login as requestLogin,
    logout as requestLogout,
} from "../services/auth";
import { AuthContext, type AuthState } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        status: "loading",
        user: null,
        error: null,
    });
    const sessionRequestId = useRef(0);

    const loadSession = useCallback(async () => {
        const requestId = ++sessionRequestId.current;
        try {
            const user = await getCurrentUser();
            if (requestId !== sessionRequestId.current) return;
            setState({ status: "authenticated", user, error: null });
        } catch (error) {
            if (requestId !== sessionRequestId.current) return;
            if (isUnauthorized(error)) {
                clearCSRFToken();
                setState({
                    status: "unauthenticated",
                    user: null,
                    error: null,
                });
                return;
            }
            setState({
                status: "error",
                user: null,
                error: getAuthErrorMessage(error),
            });
        }
    }, []);

    const refreshSession = useCallback(async () => {
        setState({ status: "loading", user: null, error: null });
        await loadSession();
    }, [loadSession]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadSession();
        }, 0);

        function handleUnauthorized() {
            sessionRequestId.current += 1;
            setState({
                status: "unauthenticated",
                user: null,
                error: null,
            });
        }

        window.addEventListener(unauthorizedEvent, handleUnauthorized);
        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener(unauthorizedEvent, handleUnauthorized);
        };
    }, [loadSession]);

    const login = useCallback(async (email: string, password: string) => {
        const requestId = ++sessionRequestId.current;
        const result = await requestLogin(email, password);
        if (requestId !== sessionRequestId.current) return;
        setCSRFToken(result.csrf_token);
        try {
            const user = await getCurrentUser();
            if (requestId !== sessionRequestId.current) return;
            setState({ status: "authenticated", user, error: null });
        } catch (error) {
            if (requestId === sessionRequestId.current) clearCSRFToken();
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        sessionRequestId.current += 1;
        await requestLogout();
        clearCSRFToken();
        setState({ status: "unauthenticated", user: null, error: null });
    }, []);

    const value = useMemo(
        () => ({ ...state, refreshSession, login, logout }),
        [state, refreshSession, login, logout],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

function isUnauthorized(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "status" in error.response &&
        error.response.status === 401
    );
}

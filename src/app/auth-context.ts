import {
    createContext,
    useContext,
} from "react";
import type { CurrentUser } from "../services/auth";

export type AuthState =
    | { status: "loading"; user: null; error: null }
    | { status: "unauthenticated"; user: null; error: null }
    | { status: "authenticated"; user: CurrentUser; error: null }
    | { status: "error"; user: null; error: string };

export type AuthContextValue = AuthState & {
    refreshSession: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider.");
    }
    return context;
}

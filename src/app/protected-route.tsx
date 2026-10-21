import { useState } from "react";
import {
    Link,
    Navigate,
    Outlet,
    useLocation,
    useParams,
} from "react-router-dom";

import { useAuth } from "./auth-context";
import { getAuthErrorMessage } from "../services/auth";
import type { UserRole } from "../services/auth";
import "./protected-route.css";

function AuthStateMessage({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <main className="auth-message">
            <p>{message}</p>
            {onRetry && (
                <button type="button" onClick={onRetry}>
                    Try again
                </button>
            )}
        </main>
    );
}

export function RoleHomeRedirect() {
    const auth = useAuth();

    if (auth.status === "loading") {
        return <AuthStateMessage message="Checking your session..." />;
    }
    if (auth.status === "error") {
        return (
            <AuthStateMessage
                message={`Unable to verify your session: ${auth.error}`}
                onRetry={() => void auth.refreshSession()}
            />
        );
    }
    if (auth.status === "unauthenticated") {
        return <Navigate to="/login" replace />;
    }
    return (
        <Navigate
            to={auth.user.role === "owner" ? "/owner" : "/employee"}
            replace
        />
    );
}

export function LoginRedirect() {
    const auth = useAuth();
    if (auth.status === "authenticated") {
        return (
            <Navigate
                to={auth.user.role === "owner" ? "/owner" : "/employee"}
                replace
            />
        );
    }
    return null;
}

export function RequireRole({ role }: { role: UserRole }) {
    const auth = useAuth();
    const location = useLocation();
    const [logoutError, setLogoutError] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);

    if (auth.status === "loading") {
        return <AuthStateMessage message="Checking your session..." />;
    }
    if (auth.status === "error") {
        return (
            <AuthStateMessage
                message={`Unable to verify your session: ${auth.error}`}
                onRetry={() => void auth.refreshSession()}
            />
        );
    }
    if (auth.status === "unauthenticated") {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }
    if (auth.user.role !== role) {
        return (
            <Navigate
                to={auth.user.role === "owner" ? "/owner" : "/employee"}
                replace
            />
        );
    }

    async function signOut() {
        setLogoutError("");
        setLoggingOut(true);
        try {
            await auth.logout();
        } catch (error) {
            setLogoutError(getAuthErrorMessage(error));
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <div className="auth-shell">
            <header className="auth-bar">
                <Link
                    className="auth-brand"
                    to={role === "owner" ? "/owner" : "/employee"}
                >
                    ATTOR
                </Link>
                <nav className="auth-nav" aria-label="Main navigation">
                    <Link to={role === "owner" ? "/owner" : "/employee"}>
                        Dashboard
                    </Link>
                    {role === "owner" && (
                        <>
                            <Link to="/owner/analytics">Analytics</Link>
                            <Link to="/owner/employees">Employees</Link>
                        </>
                    )}
                    {role === "employee" && (
                        <Link to="/employee/clients">Clients</Link>
                    )}
                </nav>
                <span className="auth-identity">
                    {auth.user.role === "owner" ? "Owner" : "Employee"}
                </span>
                <button
                    type="button"
                    className="auth-signout"
                    onClick={() => void signOut()}
                    disabled={loggingOut}
                >
                    {loggingOut ? "Signing out..." : "Sign out"}
                </button>
            </header>
            {logoutError && (
                <p className="auth-notice" role="alert">
                    Could not sign out: {logoutError}
                </p>
            )}
            <Outlet />
        </div>
    );
}

export function LegacyRoute({ destination }: { destination: string }) {
    const auth = useAuth();
    const location = useLocation();
    const { id } = useParams();

    if (auth.status === "loading") {
        return <AuthStateMessage message="Checking your session..." />;
    }
    if (auth.status === "error") {
        return (
            <AuthStateMessage
                message={`Unable to verify your session: ${auth.error}`}
                onRetry={() => void auth.refreshSession()}
            />
        );
    }
    if (auth.status === "unauthenticated") {
        return <Navigate to="/login" replace />;
    }

    const base = auth.user.role === "owner" ? "/owner" : "/employee";
    const path =
        destination === "analytics"
            ? "/owner/analytics"
            : destination === "clients/:id"
              ? `${base}/clients/${id}`
              : `${base}/${destination}`;
    return (
        <Navigate
            to={{
                pathname: path,
                search: location.search,
                hash: location.hash,
            }}
            replace
        />
    );
}

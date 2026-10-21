import { useState, type FormEvent } from "react";

import { useAuth } from "../../app/auth-context";
import { getAuthErrorMessage } from "../../services/auth";
import { LoginRedirect } from "../../app/protected-route";
import "./login.css";

export default function LoginPage() {
    const auth = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await auth.login(email.trim(), password);
        } catch (requestError) {
            setError(getAuthErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="login-page">
            <LoginRedirect />
            <form className="login-card" onSubmit={submit}>
                <span className="login-brand">ATTOR</span>
                <h1>Sign in</h1>
                <p>Access your Attor workspace.</p>

                <label htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={320}
                    disabled={submitting}
                />

                <label htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    maxLength={72}
                    disabled={submitting}
                />

                {error && (
                    <p className="login-error" role="alert">
                        {error}
                    </p>
                )}

                <button type="submit" disabled={submitting}>
                    {submitting ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </main>
    );
}

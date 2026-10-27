import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { TurnstileWidget } from "../../components/TurnstileWidget";
import { getAuthErrorMessage } from "../../services/auth";
import {
    acceptEmployeeInvitation,
    completeOwnerRegistration,
    registerOwner,
    requestPasswordReset,
    resetPassword,
    resendVerification,
    verifyOwnerEmail,
} from "../../services/auth";
import "../login/login.css";
import "./flows.css";

export function CreateOwnerAccountPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [widgetGeneration, setWidgetGeneration] = useState(0);
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (!turnstileToken) {
            setError("Complete the security check before creating an account.");
            return;
        }
        setSubmitting(true);
        try {
            await registerOwner(email.trim(), password, turnstileToken);
            setSubmitted(true);
        } catch (requestError) {
            setError(getAuthErrorMessage(requestError));
            setTurnstileToken("");
            setWidgetGeneration((generation) => generation + 1);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthPage title="Create owner account">
            {submitted ? (
                <>
                    <p role="status">
                        If the address can be registered, a verification email
                        will be sent. Check your inbox, or request another
                        verification email.
                    </p>
                    <AuthLinks>
                        <Link to="/resend-verification">Resend verification</Link>
                        <Link to="/login">Return to sign in</Link>
                    </AuthLinks>
                </>
            ) : (
                <form onSubmit={submit}>
                    <p>Create an owner account to set up your store.</p>
                    <label htmlFor="register-email">Email</label>
                    <input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        maxLength={320}
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={submitting}
                    />
                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={72}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={submitting}
                    />
                    <p className="auth-hint">Use 12-72 characters.</p>
                    <TurnstileWidget
                        key={widgetGeneration}
                        siteKey={siteKey}
                        onToken={setTurnstileToken}
                    />
                    <AuthFeedback error={error} />
                    <button type="submit" disabled={submitting || !turnstileToken}>
                        {submitting ? "Creating account..." : "Create account"}
                    </button>
                </form>
            )}
            <AuthLinks>
                <Link to="/login">Return to sign in</Link>
            </AuthLinks>
        </AuthPage>
    );
}

export function ResendVerificationPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const result = await resendVerification(email.trim());
            setMessage(result.message);
        } catch (requestError) {
            setError(getAuthErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthPage title="Resend verification">
            <form onSubmit={submit}>
                <p>Enter the email address used to create your owner account.</p>
                <label htmlFor="resend-email">Email</label>
                <input
                    id="resend-email"
                    type="email"
                    autoComplete="email"
                    maxLength={320}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={submitting}
                />
                <AuthFeedback error={error} message={message} />
                <button type="submit" disabled={submitting}>
                    {submitting ? "Sending..." : "Send verification email"}
                </button>
            </form>
            <AuthLinks>
                <Link to="/register">Create owner account</Link>
                <Link to="/login">Return to sign in</Link>
            </AuthLinks>
        </AuthPage>
    );
}

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = getTokenFromLink(searchParams);
    const [storeName, setStoreName] = useState("");
    const [completionToken, setCompletionToken] = useState("");
    const [error, setError] = useState("");
    const [completed, setCompleted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            let currentCompletionToken = completionToken;
            if (!currentCompletionToken) {
                const result = await verifyOwnerEmail(token);
                currentCompletionToken = result.completion_token;
                setCompletionToken(currentCompletionToken);
            }
            await completeOwnerRegistration(currentCompletionToken, storeName.trim());
            setCompleted(true);
        } catch (requestError) {
            setError(getAuthErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthPage title={completed ? "Store created" : "Verify email and create store"}>
            {completed ? (
                <>
                    <p role="status">
                        Your owner account and store are ready. Sign in to
                        continue.
                    </p>
                    <AuthLinks>
                        <Link to="/login">Go to sign in</Link>
                    </AuthLinks>
                </>
            ) : !token ? (
                <>
                    <p>This verification link is missing or invalid.</p>
                    <AuthLinks>
                        <Link to="/resend-verification">Request a new link</Link>
                    </AuthLinks>
                </>
            ) : (
                <form onSubmit={submit}>
                    <p>Verify your email, then choose a name for your store.</p>
                    <label htmlFor="store-name">Store name</label>
                    <input
                        id="store-name"
                        type="text"
                        maxLength={255}
                        required
                        value={storeName}
                        onChange={(event) => setStoreName(event.target.value)}
                        disabled={submitting}
                    />
                    <AuthFeedback error={error} />
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Verifying..." : "Verify and create store"}
                    </button>
                </form>
            )}
            {!completed && (
                <AuthLinks>
                    <Link to="/resend-verification">Request a new verification link</Link>
                    <Link to="/login">Return to sign in</Link>
                </AuthLinks>
            )}
        </AuthPage>
    );
}

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const result = await requestPasswordReset(email.trim());
            setMessage(result.message);
        } catch (requestError) {
            setError(getAuthErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthPage title="Forgot password">
            <form onSubmit={submit}>
                <p>Enter your email to request password reset instructions.</p>
                <label htmlFor="forgot-email">Email</label>
                <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    maxLength={320}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={submitting}
                />
                <AuthFeedback error={error} message={message} />
                <button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Send reset instructions"}
                </button>
            </form>
            <AuthLinks>
                <Link to="/login">Return to sign in</Link>
            </AuthLinks>
        </AuthPage>
    );
}

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = getTokenFromLink(searchParams);
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState("");
    const [completed, setCompleted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (password !== confirmation) {
            setError("Passwords do not match.");
            return;
        }
        setSubmitting(true);
        try {
            await resetPassword(token, password);
            setCompleted(true);
        } catch (requestError) {
            setError(getAuthErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthPage title={completed ? "Password updated" : "Reset password"}>
            {completed ? (
                <>
                    <p role="status">Your password has been updated. Sign in again.</p>
                    <AuthLinks>
                        <Link to="/login">Go to sign in</Link>
                    </AuthLinks>
                </>
            ) : !token ? (
                <>
                    <p>This password reset link is missing or invalid.</p>
                    <AuthLinks>
                        <Link to="/forgot-password">Request a new link</Link>
                    </AuthLinks>
                </>
            ) : (
                <form onSubmit={submit}>
                    <p>Choose a new password for your account.</p>
                    <label htmlFor="reset-password">New password</label>
                    <input
                        id="reset-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={72}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={submitting}
                    />
                    <label htmlFor="confirm-password">Confirm password</label>
                    <input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={72}
                        required
                        value={confirmation}
                        onChange={(event) => setConfirmation(event.target.value)}
                        disabled={submitting}
                    />
                    <AuthFeedback error={error} />
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Updating..." : "Update password"}
                    </button>
                </form>
            )}
            {!completed && (
                <AuthLinks>
                    <Link to="/forgot-password">Request a new reset link</Link>
                    <Link to="/login">Return to sign in</Link>
                </AuthLinks>
            )}
        </AuthPage>
    );
}

export function AcceptInvitationPage() {
    const [searchParams] = useSearchParams();
    const token = getTokenFromLink(searchParams);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await acceptEmployeeInvitation(token, password);
            setAccepted(true);
        } catch (requestError) {
            setError(getAuthErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthPage title={accepted ? "Invitation accepted" : "Join your store"}>
            {accepted ? (
                <>
                    <p role="status">Your employee account is ready. Sign in to continue.</p>
                    <AuthLinks>
                        <Link to="/login">Go to sign in</Link>
                    </AuthLinks>
                </>
            ) : !token ? (
                <>
                    <p>This invitation link is missing or invalid.</p>
                    <AuthLinks>
                        <Link to="/login">Return to sign in</Link>
                    </AuthLinks>
                </>
            ) : (
                <form onSubmit={submit}>
                    <p>Set a password to accept your employee invitation.</p>
                    <label htmlFor="invite-password">Password</label>
                    <input
                        id="invite-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={72}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={submitting}
                    />
                    <AuthFeedback error={error} />
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Accepting..." : "Accept invitation"}
                    </button>
                </form>
            )}
        </AuthPage>
    );
}

function AuthPage({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <main className="login-page">
            <section className="login-card auth-workflow-card">
                <Link className="login-brand" to="/">ATTOR</Link>
                <h1>{title}</h1>
                {children}
            </section>
        </main>
    );
}

function AuthFeedback({ error, message }: { error?: string; message?: string }) {
    return (
        <>
            {error && <p className="login-error" role="alert">{error}</p>}
            {message && <p className="auth-success" role="status">{message}</p>}
        </>
    );
}

function AuthLinks({ children }: { children: React.ReactNode }) {
    return <nav className="auth-workflow-links">{children}</nav>;
}

function getTokenFromLink(searchParams: URLSearchParams) {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    return fragment.get("token") ?? searchParams.get("token") ?? "";
}

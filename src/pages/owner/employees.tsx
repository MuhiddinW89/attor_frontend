import { useState, type FormEvent } from "react";

import { getAuthErrorMessage, inviteEmployee } from "../../services/auth";

export default function EmployeesPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setMessage("");
        setSubmitting(true);
        try {
            const result = await inviteEmployee(email.trim());
            setMessage(result.message);
            setEmail("");
        } catch (requestError) {
            setError(getAuthErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="page-container">
            <span className="dashboard-eyebrow">ATTOR</span>
            <h1>Employee management</h1>
            <section className="dashboard-stat-card">
                <h2>Invite an employee</h2>
                <p>
                    Employees join this store through an email invitation.
                </p>
                <form onSubmit={submit}>
                    <label htmlFor="employee-invite-email">Employee email</label>
                    <input
                        id="employee-invite-email"
                        type="email"
                        autoComplete="email"
                        maxLength={320}
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={submitting}
                    />
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Sending invitation..." : "Send invitation"}
                    </button>
                </form>
                {error && <p role="alert">{error}</p>}
                {message && <p role="status">{message}</p>}
            </section>
        </main>
    );
}

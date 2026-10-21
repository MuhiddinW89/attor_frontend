import { Link } from "react-router-dom";

import "./employee.css";

export default function EmployeeDashboardPage() {
    return (
        <main className="employee-page">
            <header className="employee-header">
                <span className="employee-eyebrow">ATTOR</span>
                <h1>Your workspace</h1>
                <p>Manage customer visits and record sales.</p>
            </header>
            <div className="employee-line" />
            <section className="employee-actions">
                <Link className="employee-action primary" to="/employee/sales/new">
                    <span aria-hidden="true">+</span>
                    Create a sale
                </Link>
                <Link className="employee-action" to="/employee/clients">
                    <span aria-hidden="true">⌕</span>
                    Find a client
                </Link>
                <Link className="employee-action" to="/employee/reminders">
                    <span aria-hidden="true">✓</span>
                    View reminders
                </Link>
            </section>
        </main>
    );
}

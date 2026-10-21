export default function EmployeesPage() {
    return (
        <main className="page-container">
            <span className="dashboard-eyebrow">ATTOR</span>
            <h1>Employee management</h1>
            <section className="dashboard-stat-card">
                <h2>Unavailable</h2>
                <p>
                    The backend does not yet provide employee listing,
                    invitation, or employee-management endpoints. This feature
                    is disabled until those APIs are available.
                </p>
            </section>
        </main>
    );
}

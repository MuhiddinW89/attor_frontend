import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import rosemaryIcon from "../../assets/icons/rosemary.png";

import {
    getReminders,
} from "../../services/reminders/get-reminders";

import "./dashboard.css";


function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "Good morning";
    }

    if (hour >= 12 && hour < 18) {
        return "Good afternoon";
    }

    return "Good evening";
}

export default function DashboardPage() {
    const { data: reminders = [], isLoading, error } =
        useQuery({
            queryKey: ["dashboard-reminders"],
            queryFn: () => getReminders("all"),
        });

    const pendingReminders = reminders.filter(
        (item) => !item.is_sent,
    );

    const recentSales = [...reminders]
        .sort(
            (a, b) =>
                new Date(b.sale_date).getTime() -
                new Date(a.sale_date).getTime(),
        )
        .slice(0, 5);

    const today = new Date();

    const formattedDate = today.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        },
    );

    if (isLoading) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-state">
                    Loading...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-state">
                    Something went wrong.
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <span className="dashboard-eyebrow">
                        ATTOR
                    </span>

                    <h1>
                        {getGreeting()}
                    </h1>

                    <p>
                        {formattedDate}
                    </p>
                </div>
            </header>

            <div className="dashboard-line" />

            <section className="dashboard-stats">
                <div className="dashboard-stat-card">
                    <span>Today's</span>
                    <span>Sales</span>

                    <strong>—</strong>
                </div>

                <div className="dashboard-stat-card">
                    <span>Monthly</span>
                    <span>Revenue</span>

                    <strong>—</strong>
                </div>

                <div className="dashboard-stat-card">
                    <span>Repeat</span>
                    <span>Customers</span>

                    <strong>—</strong>
                </div>

                <div className="dashboard-stat-card">
                    <span>Pending</span>
                    <span>Follow-ups</span>

                    <strong>
                        {pendingReminders.length}
                    </strong>
                </div>
            </section>

            <section className="dashboard-actions">
                <Link
                    to="/sales/new"
                    className="dashboard-action primary"
                >
                    <span className="dashboard-action-icon">
                        +
                    </span>

                    <span>Add Sale</span>
                </Link>

                <Link
                    to="/clients"
                    className="dashboard-action"
                >
                    <span className="dashboard-action-icon">
                        ⌕
                    </span>

                    <span>Find Client</span>
                </Link>

                <Link
                    to="/reminders"
                    className="dashboard-action"
                >
                    <span className="dashboard-action-icon">
                        ✓
                    </span>

                    <span>View Reminders</span>
                </Link>
            </section>

            <section className="dashboard-recent">
                <div className="dashboard-section-header">
                    <h2>Recent Sales</h2>
                </div>

                {recentSales.length === 0 ? (
                    <div className="dashboard-empty">
                        No recent sales.
                    </div>
                ) : (
                    <div className="dashboard-sales-list">
                        {recentSales.map((item) => (
                            <article
                                key={item.id}
                                className="dashboard-sale-card"
                            >
                                <div className="dashboard-sale-icon">
                                    <img
                                        src={rosemaryIcon}
                                        alt=""
                                    />
                                </div>

                                <div className="dashboard-sale-main">
                                    <h3>
                                        {item.client_name}
                                    </h3>

                                    <p>
                                        {item.perfume_name} —{" "}
                                        {item.volume_ml} ml
                                    </p>

                                    <time>
                                        {new Date(
                                            item.sale_date,
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            },
                                        )}
                                    </time>
                                </div>

                                <div className="dashboard-sale-price">
                                    —
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import rosemaryIcon from "../../assets/icons/rosemary.png";

import {
    getAnalytics,
} from "../../services/analytics/get";

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


function formatUZS(value: number) {
    return `${Math.round(
        value,
    ).toLocaleString("en-US")} UZS`;
}


export default function DashboardPage() {
    const {
        data: reminders = [],
        isLoading: remindersLoading,
        error: remindersError,
    } = useQuery({
        queryKey: ["dashboard-reminders"],
        queryFn: () => getReminders("all"),
    });

    const today = new Date();

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    /*
     * Current month analytics.
     *
     * Example:
     * /analytics?year=2026&month=9
     */
    const {
        data: monthlyAnalytics,
        isLoading: monthlyAnalyticsLoading,
        error: monthlyAnalyticsError,
    } = useQuery({
        queryKey: [
            "dashboard-monthly-analytics",
            currentYear,
            currentMonth,
        ],
        queryFn: () =>
            getAnalytics({
                year: currentYear,
                month: currentMonth,
            }),
    });

    /*
     * Today's analytics.
     *
     * Example:
     * /analytics?year=2026&month=9&day=28
     */
    const {
        data: todayAnalytics,
        isLoading: todayAnalyticsLoading,
        error: todayAnalyticsError,
    } = useQuery({
        queryKey: [
            "dashboard-today-analytics",
            currentYear,
            currentMonth,
            currentDay,
        ],
        queryFn: () =>
            getAnalytics({
                year: currentYear,
                month: currentMonth,
                day: currentDay,
            }),
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

    const formattedDate = today.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        },
    );

    const isLoading =
        remindersLoading ||
        monthlyAnalyticsLoading ||
        todayAnalyticsLoading;

    const hasError =
        remindersError ||
        monthlyAnalyticsError ||
        todayAnalyticsError;

    if (isLoading) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-state">
                    Loading...
                </div>
            </main>
        );
    }

    if (hasError) {
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
                {/* =========================
                    Today's Sales
                ========================= */}
                <div className="dashboard-stat-card">
                    <span>Today's</span>
                    <span>Sales</span>

                    <strong>
                        {todayAnalytics
                            ? todayAnalytics.total_sales
                            : "—"}
                    </strong>
                </div>

                {/* =========================
                    Monthly Revenue
                ========================= */}
                <div className="dashboard-stat-card">
                    <span>Monthly</span>
                    <span>Revenue</span>

                    <strong>
                        {monthlyAnalytics
                            ? formatUZS(
                                  monthlyAnalytics.total_revenue,
                              )
                            : "—"}
                    </strong>
                </div>

                {/* =========================
                    Monthly Repeat Rate
                ========================= */}
                <div className="dashboard-stat-card">
                    <span>Monthly</span>
                    <span>Repeat Rate</span>

                    <strong>
                        {monthlyAnalytics
                            ? `${Math.round(
                                  monthlyAnalytics.repeat_rate,
                              )}%`
                            : "—"}
                    </strong>
                </div>

                {/* =========================
                    Pending Follow-ups
                ========================= */}
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

                <Link
                    to="/analytics"
                    className="dashboard-action"
                >
                    <span className="dashboard-action-icon">
                        ◌
                    </span>

                    <span>Analytics</span>
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
                                    {formatUZS(item.price)}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
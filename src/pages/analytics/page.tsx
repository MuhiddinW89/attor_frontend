import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getAnalytics } from "../../services/analytics/get";

import "./analytics.css";

const MONTHS = Array.from(
    { length: 12 },
    (_, index) => index + 1,
);

const WEEKS = Array.from(
    { length: 6 },
    (_, index) => index + 1,
);

const YEARS = [2026, 2025, 2024];

function pad2(value: number) {
    return String(value).padStart(2, "0");
}

function formatUZS(value: number) {
    return `${Math.round(value).toLocaleString(
        "en-US",
    )} UZS`;
}

export default function AnalyticsPage() {
    const [year, setYear] = useState(2026);

    const [month, setMonth] =
        useState<number | undefined>();

    const [week, setWeek] =
        useState<number | undefined>();

    const [day, setDay] =
        useState<number | undefined>();

    /*
     * Build API filters.
     *
     * "All" means undefined and is therefore
     * not sent to the backend.
     */
    const filters = useMemo(() => {
        const result: {
            year?: number;
            month?: number;
            week?: number;
            day?: number;
        } = {
            year,
        };

        if (month !== undefined) {
            result.month = month;
        }

        /*
         * Week is a week INSIDE the selected month.
         * Therefore it only makes sense when a month
         * has been selected.
         */
        if (
            month !== undefined &&
            week !== undefined
        ) {
            result.week = week;
        }

        /*
         * Day also belongs to the selected month.
         */
        if (
            month !== undefined &&
            day !== undefined
        ) {
            result.day = day;
        }

        return result;
    }, [year, month, week, day]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["analytics", filters],
        queryFn: () => getAnalytics(filters),
    });

    /*
     * Number of days in the selected month.
     */
    const selectedMonthDays = useMemo(() => {
        if (month === undefined) {
            return [];
        }

        const days = new Date(
            year,
            month,
            0,
        ).getDate();

        return Array.from(
            { length: days },
            (_, index) => index + 1,
        );
    }, [year, month]);

    /*
     * Change year.
     *
     * If the selected day doesn't exist in the
     * newly selected year/month, reset the day.
     */
    function handleYearChange(
    event: React.ChangeEvent<HTMLSelectElement>,
) {
    const nextYear = Number(event.target.value);

    setYear(nextYear);

    // Week/day depend on the calendar of the selected year.
    // Reset them when the year changes.
    setWeek(undefined);
    setDay(undefined);
}

    /*
     * Month change.
     *
     * Changing the month resets week and day,
     * because both depend on the selected month.
     */
    function handleMonthChange(
        event: React.ChangeEvent<HTMLSelectElement>,
    ) {
        const value = event.target.value;

        if (!value) {
            setMonth(undefined);
            setWeek(undefined);
            setDay(undefined);
            return;
        }

        setMonth(Number(value));
        setWeek(undefined);
        setDay(undefined);
    }

    function handleWeekChange(
        event: React.ChangeEvent<HTMLSelectElement>,
    ) {
        const value = event.target.value;

        if (!value) {
            setWeek(undefined);
            return;
        }

        setWeek(Number(value));
    }

    function handleDayChange(
        event: React.ChangeEvent<HTMLSelectElement>,
    ) {
        const value = event.target.value;

        if (!value) {
            setDay(undefined);
            return;
        }

        setDay(Number(value));
    }

    return (
        <main className="analytics-page">
            {/* =====================================================
                Header
            ===================================================== */}

            <header className="analytics-header">
                <Link
                    to="/"
                    className="analytics-brand"
                >
                    ATTOR
                </Link>

                <div>
                    <span className="analytics-eyebrow">
                        BUSINESS ANALYTICS
                    </span>

                    <h1>Analytics</h1>

                    <p>
                        Track sales, revenue and
                        customer behavior.
                    </p>
                </div>
            </header>

            <div className="analytics-line" />

            {/* =====================================================
                Filters
            ===================================================== */}

            <section className="analytics-filters">
                <div className="analytics-filter-fields">
                    {/* =========================
                        Year
                    ========================= */}

                    <label>
                        <span>Y</span>

                        <select
                            value={year}
                            onChange={
                                handleYearChange
                            }
                        >
                            {YEARS.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* =========================
                        Month
                    ========================= */}

                    <label>
                        <span>M</span>

                        <select
                            value={month ?? ""}
                            onChange={
                                handleMonthChange
                            }
                        >
                            <option value="">
                                All
                            </option>

                            {MONTHS.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {pad2(item)}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* =========================
                        Week
                    ========================= */}

                    <label>
                        <span>W</span>

                        <select
                            value={week ?? ""}
                            disabled={
                                month === undefined
                            }
                            onChange={
                                handleWeekChange
                            }
                        >
                            <option value="">
                                All
                            </option>

                            {WEEKS.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {pad2(item)}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* =========================
                        Day
                    ========================= */}

                    <label>
                        <span>D</span>

                        <select
                            value={day ?? ""}
                            disabled={
                                month === undefined
                            }
                            onChange={
                                handleDayChange
                            }
                        >
                            <option value="">
                                All
                            </option>

                            {selectedMonthDays.map(
                                (item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {pad2(item)}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>
                </div>
            </section>

            {/* =====================================================
                Loading / Error
            ===================================================== */}

            {error ? (
                <section className="analytics-empty">
                    Unable to load analytics.
                </section>
            ) : isLoading || !data ? (
                <section className="analytics-empty">
                    Loading analytics...
                </section>
            ) : (
                <>
                    {/* =================================================
                        Statistics
                    ================================================= */}

                    <section className="analytics-stats">
                        <article>
                            <span>
                                Total Revenue
                            </span>

                            <strong>
                                {formatUZS(
                                    data.total_revenue,
                                )}
                            </strong>
                        </article>

                        <article>
                            <span>
                                Total Sales
                            </span>

                            <strong>
                                {data.total_sales.toLocaleString(
                                    "en-US",
                                )}
                            </strong>
                        </article>

                        <article>
                            <span>
                                Average Purchase
                            </span>

                            <strong>
                                {formatUZS(
                                    data.average_purchase,
                                )}
                            </strong>
                        </article>

                        <article>
                            <span>
                                Repeat Rate
                            </span>

                            <strong>
                                {data.repeat_rate.toFixed(
                                    1,
                                )}
                                %
                            </strong>

                            <small>
                                {
                                    data.repeat_customers
                                }{" "}
                                repeat customers
                            </small>
                        </article>
                    </section>

                    {/* =================================================
                        Revenue Overview
                    ================================================= */}

                    <section className="analytics-section">
                        <div className="analytics-section-title">
                            <div>
                                <span>
                                    PERFORMANCE
                                </span>

                                <h2>
                                    Revenue Overview
                                </h2>
                            </div>
                        </div>

                        {data.revenue_overview
                            .length === 0 ? (
                            <div className="analytics-chart-empty">
                                No sales for this
                                period.
                            </div>
                        ) : (
                            <div className="analytics-chart">
                                {data.revenue_overview.map(
                                    (item) => {
                                        const maxRevenue =
                                            Math.max(
                                                ...data.revenue_overview.map(
                                                    (
                                                        point,
                                                    ) =>
                                                        point.revenue,
                                                ),
                                                1,
                                            );

                                        const height =
                                            Math.max(
                                                8,
                                                (item.revenue /
                                                    maxRevenue) *
                                                    100,
                                            );

                                        return (
                                            <div
                                                key={
                                                    item.label
                                                }
                                                className="analytics-chart-item"
                                            >
                                                <div className="analytics-bar-wrap">
                                                    <div
                                                        className="analytics-bar"
                                                        style={{
                                                            height: `${height}%`,
                                                        }}
                                                        title={`${item.label}: ${formatUZS(
                                                            item.revenue,
                                                        )} · ${
                                                            item.sales
                                                        } sales`}
                                                    />
                                                </div>

                                                <span>
                                                    {
                                                        item.label
                                                    }
                                                </span>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </section>

                    {/* =================================================
                        Top Perfumes + Top Customers
                    ================================================= */}

                    <section className="analytics-grid">
                        {/* =============================
                            Top Perfumes
                        ============================= */}

                        <div className="analytics-section">
                            <div className="analytics-section-title">
                                <div>
                                    <span>
                                        PRODUCTS
                                    </span>

                                    <h2>
                                        Top Perfumes
                                    </h2>
                                </div>
                            </div>

                            {data.top_perfumes
                                .length === 0 ? (
                                <div className="analytics-ranking-empty">
                                    No perfume data.
                                </div>
                            ) : (
                                <div className="analytics-ranking">
                                    {data.top_perfumes.map(
                                        (
                                            item,
                                            index,
                                        ) => (
                                            <article
                                                key={
                                                    item.perfume_name
                                                }
                                            >
                                                <b>
                                                    {index +
                                                        1}
                                                </b>

                                                <div>
                                                    <strong>
                                                        {
                                                            item.perfume_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            item.sales
                                                        }{" "}
                                                        sales
                                                    </span>
                                                </div>

                                                <em>
                                                    {formatUZS(
                                                        item.revenue,
                                                    )}
                                                </em>
                                            </article>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>

                        {/* =============================
                            Top Customers
                        ============================= */}

                        <div className="analytics-section">
                            <div className="analytics-section-title">
                                <div>
                                    <span>
                                        CUSTOMERS
                                    </span>

                                    <h2>
                                        Top Customers
                                    </h2>
                                </div>
                            </div>

                            {data.top_customers
                                .length === 0 ? (
                                <div className="analytics-ranking-empty">
                                    No customer data.
                                </div>
                            ) : (
                                <div className="analytics-ranking">
                                    {data.top_customers.map(
                                        (
                                            item,
                                            index,
                                        ) => (
                                            <Link
                                                key={
                                                    item.client_id
                                                }
                                                to={`/clients/${item.client_id}`}
                                            >
                                                <b>
                                                    {index +
                                                        1}
                                                </b>

                                                <div>
                                                    <strong>
                                                        {
                                                            item.full_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            item.sales
                                                        }{" "}
                                                        sales
                                                    </span>
                                                </div>

                                                <em>
                                                    {formatUZS(
                                                        item.revenue,
                                                    )}
                                                </em>
                                            </Link>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* =================================================
                        Key Insights
                    ================================================= */}

                    <section className="analytics-insights">
                        <span>
                            KEY INSIGHTS
                        </span>

                        <h2>
                            What stands out
                        </h2>

                        {data.key_insights.length ===
                        0 ? (
                            <p>
                                No insights available
                                for this period.
                            </p>
                        ) : (
                            data.key_insights.map(
                                (item) => (
                                    <p key={item}>
                                        {item}
                                    </p>
                                ),
                            )
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
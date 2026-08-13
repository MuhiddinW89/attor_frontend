import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import "./reminders.css";

import {
    getReminders,
    type ReminderStatus,
} from "../../services/reminders/get-reminders";

import MarkSentButton from "../../features/reminders/mark-sent-button";
// import ClientSearch from "../../features/search/client-search";
import Card from "../../components/ui/Card";

import arrowIcon from "../../assets/icons/arrow.png";
import calendarIcon from "../../assets/icons/calendar.png";
import rosemaryIcon from "../../assets/icons/rosemary.png";
import phoneIcon from "../../assets/icons/phone.png";


function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(
        diffMs / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
        return "Today";
    }

    if (diffDays === 1) {
        return "1 day ago";
    }

    if (diffDays > 1) {
        return `${diffDays} days ago`;
    }

    return "Upcoming";
}

function formatReminderStatus(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = date.getTime() - now.getTime();

    const diffDays = Math.ceil(
        diffMs / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 0) {
        const overdueDays = Math.floor(
            Math.abs(diffMs) /
                (1000 * 60 * 60 * 24),
        );

        if (overdueDays > 10) {
            return {
                label: "Forgotten",
                type: "forgotten",
            };
        }

        if (overdueDays === 0) {
            return {
                label: "Due today",
                type: "overdue",
            };
        }

        return {
            label: `${overdueDays} ${
                overdueDays === 1
                    ? "day"
                    : "days"
            } overdue`,
            type: "overdue",
        };
    }

    if (diffDays === 1) {
        return {
            label: "Due tomorrow",
            type: "urgent",
        };
    }

    return {
        label: `Due in ${diffDays} days`,
        type: "urgent",
    };
}

const tabs: {
    value: ReminderStatus;
    label: string;
}[] = [
    {
        value: "all",
        label: "All",
    },
    {
        value: "urgent",
        label: "Urgent",
    },
    {
        value: "overdue",
        label: "Overdue",
    },
    {
        value: "completed",
        label: "Completed",
    },
];

export default function RemindersPage() {
    const [status, setStatus] =
        useState<ReminderStatus>("all");

    const { data, isLoading, error } = useQuery({
        queryKey: ["reminders", status],
        queryFn: () => getReminders(status),
    });

    if (isLoading) {
        return (
            <main className="page-container">
                <div className="page-loading">
                    Loading...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="page-container">
                <div className="page-error">
                    Something went wrong.
                </div>
            </main>
        );
    }

    return (
        <main className="page-container reminders-page">
            <header className="reminders-header">
                <Link
    to="/"
    className="back-link"
    aria-label="Back"
>
    <img
        src={arrowIcon}
        alt=""
        className="back-icon"
    />
</Link>

                <h1>Reminders</h1>
            </header>

            <div className="reminders-gold-line" />

            <nav className="reminder-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        className={`reminder-tab ${
                            status === tab.value
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setStatus(tab.value)
                        }
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <section className="reminders-section">
                {data?.length === 0 && (
                    <Card>
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                ✓
                            </div>

                            <h3>
                                {status === "completed"
                                    ? "No completed reminders"
                                    : "All caught up"}
                            </h3>

                            <p>
                                {status === "completed"
                                    ? "You don't have any completed reminders yet."
                                    : "There are no reminders in this category."}
                            </p>
                        </div>
                    </Card>
                )}

                <div className="reminders-list">
                    {data?.map((item) => {
                        const reminderStatus =
                            !item.is_sent
                                ? formatReminderStatus(
                                      item.reminder_at,
                                  )
                                : null;

                        return (
                            <Card key={item.id}>
                                <article className="reminder-card">
                                    <Link
                                        to={`/clients/${item.client_id}`}
                                        className="client-name"
                                    >
                                        {item.client_name}
                                    </Link>

                                    {item.is_sent && (
                                        <div className="completed-badge">
                                            ✓ Completed
                                        </div>
                                    )}

                                    <a
                                        href={`tel:${item.phone}`}
                                        className="reminder-info-row"
                                    >
                                       <span className="info-icon">
    <img
        src={phoneIcon}
        alt=""
    />
</span>

                                        <span>
                                            {item.phone}
                                        </span>
                                    </a>

                                    <div className="reminder-info-row">
                                        <span className="info-icon">
    <img
        src={rosemaryIcon}
        alt=""
    />
</span>

                                        <span>
                                            {item.perfume_name} —{" "}
                                            {item.volume_ml} ml
                                        </span>
                                    </div>

                                    <div className="reminder-info-row">
                                        <span className="info-icon">
    <img
        src={calendarIcon}
        alt=""
    />
</span>

                                        <span>
                                            Purchased:{" "}
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
                                        </span>
                                    </div>

                                    <div className="reminder-relative">
                                        {formatRelativeTime(
                                            item.sale_date,
                                        )}
                                    </div>

                                    {reminderStatus && (
                                        <div
                                            className={`reminder-status-badge ${reminderStatus.type}`}
                                        >
                                            {reminderStatus.label}
                                        </div>
                                    )}

                                    {item.comment && (
                                        <div className="reminder-note">
                                            <span className="detail-label">
                                                NOTE
                                            </span>

                                            <span>
                                                {item.comment}
                                            </span>
                                        </div>
                                    )}

                                    {!item.is_sent && (
                                        <div className="reminder-actions">
                                            <a
                                                href={`tel:${item.phone}`}
                                                className="contact-client-button"
                                            >
                                                <span>☎</span>
                                                Contact Client
                                            </a>

                                            <MarkSentButton
                                                id={item.id}
                                            />
                                        </div>
                                    )}
                                </article>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
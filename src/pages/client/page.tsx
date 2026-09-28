import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import arrowIcon from "../../assets/icons/arrow.png";
import phoneIcon from "../../assets/icons/phone.png";
import instagramIcon from "../../assets/icons/instagram.png";
import rosemaryIcon from "../../assets/icons/rosemary.png";

import {
    getClientDetails,
    getClientHistory,
} from "../../services/clients/get-history";

import "./client.css";

export default function ClientPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const historyQuery = useQuery({
        queryKey: ["client-history", id],
        queryFn: () => getClientHistory(id!),
        enabled: !!id,
    });

    const detailsQuery = useQuery({
        queryKey: ["client-details", id],
        queryFn: () => getClientDetails(id!),
        enabled: !!id,
    });

    if (historyQuery.isLoading || detailsQuery.isLoading) {
        return (
            <main className="client-details-page">
                <div className="client-details-loading">
                    Loading...
                </div>
            </main>
        );
    }

    if (historyQuery.error || detailsQuery.error) {
        return (
            <main className="client-details-page">
                <div className="client-details-error">
                    Something went wrong.
                </div>
            </main>
        );
    }

    const history = historyQuery.data;
    const details = detailsQuery.data;

    if (!history || !details) {
        return (
            <main className="client-details-page">
                <div className="client-details-error">
                    Client not found.
                </div>
            </main>
        );
    }

    const client = history.client;

    const initials = client.full_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((name) => name.charAt(0).toUpperCase())
        .join("");

    const lastSale = history.sales[0];

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
            },
        );
    }

    function formatShortDate(date: string) {
        return new Date(date).toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
            },
        );
    }

    function formatBirthday(date: string) {
    const [year, month, day] = date.slice(0, 10).split("-");

    if (!year || !month || !day) {
        return date;
    }

    return `${day}.${month}.${year}`;
}

    return (
        <main className="client-details-page">
            <header className="client-details-header">
    <button
        type="button"
        className="client-details-back"
        onClick={() => navigate(-1)}
        aria-label="Back"
    >
        <img
            src={arrowIcon}
            alt=""
            className="client-details-back-icon"
        />
    </button>

    <h1>Client Details</h1>

    <Link
        to="/"
        className="client-details-attor"
    >
        ATTOR
    </Link>
</header>

            <div className="client-details-line" />

            <section className="client-profile-card">
                <div className="client-avatar">
                    {initials}
                </div>

                <h2>{client.full_name}</h2>

                <div className="client-profile-row">
                    <img
                        src={phoneIcon}
                        alt=""
                    />

                    <span>{client.phone}</span>
                </div>

                {client.instagram && (
                    <div className="client-profile-row">
                        <img
                            src={instagramIcon}
                            alt=""
                        />

                        <span>{client.instagram}</span>
                    </div>
                )}





{details.birthDate && (
    <div className="client-profile-row">
        <span className="client-birthday-icon">
            ◆
        </span>

        <span>
            {formatBirthday(details.birthDate)}
        </span>
    </div>
)}
            </section>

            <section className="client-stats">
                <div className="client-stat-card">
                    <span>Total</span>
                    <span>Purchases</span>

                    <strong>
                        {history.total_sales}
                    </strong>
                </div>

                <div className="client-stat-card">
                    <span>Total</span>
                    <span>Spending</span>

                    <strong>
                        
                        {history.total_amount.toLocaleString(
                            "en-US",
                            {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                            },
                        )}{" "}
                            UZS
                    </strong>
                </div>

                <div className="client-stat-card">
                    <span>Last</span>
                    <span>Purchase</span>

                    <strong>
                        {lastSale
                            ? formatShortDate(
                                  lastSale.sale_date,
                              )
                            : "—"}
                    </strong>
                </div>
            </section>

            <section className="client-purchase-section">
                <h2>Purchase History</h2>

                <div className="client-purchase-list">
                    {history.sales.length === 0 ? (
                        <div className="client-no-sales">
                            No purchases yet.
                        </div>
                    ) : (
                        history.sales.map((sale) => (
                            <article
                                key={sale.id}
                                className="client-purchase-card"
                            >
                                <div className="client-purchase-icon">
                                    <img
                                        src={rosemaryIcon}
                                        alt=""
                                    />
                                </div>

                                <div className="client-purchase-content">
                                    <div className="client-purchase-top">
                                        <div>
                                            <h3>
                                                {sale.perfume_name}
                                            </h3>

                                            <span className="client-purchase-volume">
                                                {sale.volume_ml} ml
                                            </span>
                                        </div>

                                        <strong>
                                            
                                            {sale.price.toLocaleString(
                                                "en-US",
                                                {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2,
                                                },
                                            )}{" "}
                                                UZS
                                        </strong>
                                    </div>

                                    <time>
                                        {formatDate(
                                            sale.sale_date,
                                        )}
                                    </time>

                                    {sale.comment && (
                                        <p>
                                            {sale.comment}
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>

            <Link
                to="/sales/new"
                state={{
                    from: `/clients/${client.id}`,
                    clientId: client.id,
                    clientName: client.full_name,
                    clientPhone: client.phone,
                }}
                className="client-add-purchase"
            >
                <span>+</span>

                <strong>
                    Add New Purchase
                </strong>
            </Link>
        </main>
    );
}
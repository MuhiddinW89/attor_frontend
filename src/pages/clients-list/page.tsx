import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import arrowIcon from "../../assets/icons/arrow.png";
import phoneIcon from "../../assets/icons/phone.png";
import instagramIcon from "../../assets/icons/instagram.png";

import { getClients } from "../../services/clients/list";

import "./clients-list.css";

export default function ClientsListPage() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const {
        data: clients = [],
        isLoading,
        isFetching,
        error,
    } = useQuery({
        queryKey: ["clients-list", debouncedSearch],
        queryFn: () => getClients(debouncedSearch),
    });

    function handleBack() {
        navigate("/");
    }

    return (
        <main className="clients-list-page">
            <header className="clients-list-header">
                <button
                    type="button"
                    className="clients-list-back"
                    onClick={handleBack}
                    aria-label="Back"
                >
                    <img
                        src={arrowIcon}
                        alt=""
                        className="clients-list-back-icon"
                    />
                </button>

                <div className="clients-list-title">
                    <h1>Clients</h1>

                    <p>
                        {clients.length}{" "}
                        {clients.length === 1
                            ? "client"
                            : "total clients"}
                    </p>
                </div>
                <Link
    to="/"
    className="clients-list-attor"
>
    ATTOR
</Link>
            </header>

            <div className="clients-list-line" />

            <div className="clients-search">
                <span
                    className="clients-search-icon"
                    aria-hidden="true"
                >
                    ⌕
                </span>

                <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search by phone, name or Instagram"
                    autoComplete="off"
                />

                {isFetching && !isLoading && (
                    <span
                        className="clients-search-loading"
                        aria-hidden="true"
                    />
                )}
            </div>

            {error ? (
                <div className="clients-empty">
                    <h2>Something went wrong</h2>

                    <p>
                        Unable to load clients.
                    </p>
                </div>
            ) : isLoading ? (
                <div className="clients-empty">
                    <p>Loading clients...</p>
                </div>
            ) : (
                <section className="clients-cards">
                    {clients.length === 0 ? (
                        <div className="clients-empty">
                            <span>⌕</span>

                            <h2>No clients found</h2>

                            <p>
                                Try searching by phone, name or
                                Instagram.
                            </p>
                        </div>
                    ) : (
                        clients.map((client) => (
                            <div
                                key={client.id}
                                className="client-list-card"
                            >
                                <div className="client-list-main">
                                    <Link
                                        to={`/clients/${client.id}`}
                                        className="client-list-name"
                                    >
                                        {client.full_name}
                                    </Link>

                                    <div className="client-list-contact">
                                        <img
                                            src={phoneIcon}
                                            alt=""
                                            className="client-contact-icon"
                                        />

                                        <span>
                                            {client.phone}
                                        </span>
                                    </div>

                                    {client.instagram && (
                                        <div className="client-list-contact">
                                            <img
                                                src={instagramIcon}
                                                alt=""
                                                className="client-contact-icon"
                                            />

                                            <span>
                                                {client.instagram}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="client-list-divider" />

                                <div className="client-list-stats">
                                    <div>
                                        <span className="client-stat-label">
                                            Total Purchases
                                        </span>

                                        <strong>
                                            {client.total_sales}
                                        </strong>
                                    </div>

                                    <div className="client-stat-revenue">
                                        <span className="client-stat-label">
                                            Total Revenue
                                        </span>

                                        <strong>
                                            
                                            {client.total_amount.toLocaleString(
                                                "en-US",
                                                {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2,
                                                },
                                            )}{" "}
                                                UZS
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            )}
        </main>
    );
}
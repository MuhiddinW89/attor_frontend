import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { searchClients } from "../../services/clients/search";

export default function ClientSearch() {
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["client-search", search],
        queryFn: () => searchClients(search),
        enabled: search.trim().length > 0,
    });

    const hasSearch = search.trim().length > 0;

    return (
        <div className="client-search">
            <div className="search-input-wrapper">
                <span className="search-icon">⌕</span>

                <input
                    type="text"
                    placeholder="Search by name, phone or Instagram..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="client-search-input"
                />

                {search.length > 0 && (
                    <button
                        type="button"
                        className="search-clear"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>

            {hasSearch && (
                <div className="search-results">
                    {isLoading && (
                        <div className="search-state">
                            Searching...
                        </div>
                    )}

                    {!isLoading && data?.length === 0 && (
                        <div className="search-state">
                            <strong>Nothing found</strong>

                            <span>
                                Try another name, phone number or Instagram.
                            </span>
                        </div>
                    )}

                    {!isLoading &&
                        data?.map((client) => (
                            <Link
                                key={client.id}
                                to={`/clients/${client.id}`}
                                className="search-result"
                            >
                                <div className="search-result-avatar">
                                    {client.full_name
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="search-result-info">
                                    <strong>
                                        {client.full_name}
                                    </strong>

                                    <span>
                                        {client.phone}
                                    </span>
                                </div>

                                <span className="search-result-arrow">
                                    →
                                </span>
                            </Link>
                        ))}
                </div>
            )}
        </div>
    );
}
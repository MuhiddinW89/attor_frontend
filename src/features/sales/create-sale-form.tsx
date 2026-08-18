import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
    Link,
    useLocation,
} from "react-router-dom";

import arrowIcon from "../../assets/icons/arrow.png";

import {
    searchClients,
    type ClientListItem,
} from "../../services/clients/search";

import { createSale } from "../../services/sales/create-sale";

type SaleStep = "phone" | "purchase";

type CreateSaleLocationState = {
    from?: string;
    clientId?: string;
    clientName?: string;
    clientPhone?: string;
};

export default function CreateSaleForm() {
    const location = useLocation();

    const navigationState =
        location.state as
            | CreateSaleLocationState
            | null;

    const clientFromDetails =
        Boolean(navigationState?.clientId);

    const [step, setStep] = useState<SaleStep>(
        clientFromDetails
            ? "purchase"
            : "phone",
    );

    const [search, setSearch] = useState(
        navigationState?.clientName ?? "",
    );

    const [phone, setPhone] = useState(
        navigationState?.clientPhone ?? "",
    );

    const [isNewCustomer, setIsNewCustomer] =
        useState(false);

    const [form, setForm] = useState({
        full_name:
            navigationState?.clientName ?? "",
        instagram: "",
        birthday: "",
        perfume_name: "",
        volume_ml: "",
        price: "",
        comment: "",
    });

    const { data, isLoading } = useQuery({
        queryKey: ["sale-client-search", search],
        queryFn: () => searchClients(search),
        enabled:
            search.trim().length >= 3 &&
            step === "phone" &&
            !clientFromDetails,
    });

    const searchDigits = search.replace(
        /\D/g,
        "",
    );

    const exactPhoneMatch =
        searchDigits.length >= 7 &&
        data?.some(
            (client) =>
                client.phone.replace(/\D/g, "") ===
                searchDigits,
        ) === true;

    const mutation = useMutation({
        mutationFn: createSale,

        onSuccess: () => {
            window.location.href = "/reminders?status=urgent";
        },
    });

    function update(
        key: keyof typeof form,
        value: string,
    ) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function selectExistingClient(
        client: ClientListItem,
    ) {
        setPhone(client.phone);

        setForm((prev) => ({
            ...prev,
            full_name: client.full_name,
        }));

        setIsNewCustomer(false);
        setStep("purchase");
    }

    function startNewCustomer() {
        const digits = search.replace(
            /\D/g,
            "",
        );

        if (digits.length >= 7) {
            setPhone(search.trim());
        } else {
            setPhone("");
        }

        setForm((prev) => ({
            ...prev,
            full_name: "",
        }));

        setIsNewCustomer(true);
        setStep("purchase");
    }

    function submitSale(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        mutation.mutate({
            full_name: form.full_name,
            phone,
            instagram:
                form.instagram || undefined,
            perfume_name: form.perfume_name,
            volume_ml: Number(
                form.volume_ml || 0,
            ),
            price: Number(form.price || 0),
            comment:
                form.comment || undefined,
        });
    }

    if (step === "purchase") {
        return (
            <form
                className="create-sale"
                onSubmit={submitSale}
            >
                <header className="create-sale-header">
                    <button
                        type="button"
                        className="create-sale-back"
                        onClick={() => {
                            if (clientFromDetails) {
                                window.history.back();
                                return;
                            }

                            setStep("phone");
                        }}
                        aria-label="Back"
                    >
                        <img
                            src={arrowIcon}
                            alt=""
                            className="create-sale-back-icon"
                        />
                    </button>

                    <h1>
                        {isNewCustomer
                            ? "Create Sale"
                            : "Add Sale"}
                    </h1>
                    <Link
    to="/"
    className="create-sale-attor"
>
    ATTOR
</Link>
                </header>

                <div className="create-sale-line" />

                <div className="sale-step-indicator">
                    <span className="sale-step-number completed">
                        ✓
                    </span>

                    <span className="sale-step-title">
                        Phone Number
                    </span>

                    <span className="sale-step-divider active" />

                    <span className="sale-step-number active">
                        2
                    </span>

                    <span className="sale-step-title">
                        Purchase Info
                    </span>
                </div>

                <section className="sale-card sale-customer-summary">
                    <div className="sale-summary-label">
                        CUSTOMER
                    </div>

                    <strong>
                        {form.full_name ||
                            "New customer"}
                    </strong>

                    {phone && (
                        <span>{phone}</span>
                    )}
                </section>

                {isNewCustomer && (
                    <section className="sale-card">
                        <h2>
                            Customer Information
                        </h2>

                        <div className="sale-fields">
                            <label className="sale-field">
                                <span>
                                    Full Name
                                </span>

                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={
                                        form.full_name
                                    }
                                    onChange={(e) =>
                                        update(
                                            "full_name",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </label>

                            <label className="sale-field">
                                <span>
                                    Phone
                                </span>

                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </label>

                            <label className="sale-field">
                                <span>
                                    Instagram
                                </span>

                                <input
                                    type="text"
                                    placeholder="@username"
                                    value={
                                        form.instagram
                                    }
                                    onChange={(e) =>
                                        update(
                                            "instagram",
                                            e.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className="sale-field">
                                <span>
                                    Birthday
                                </span>

                                <input
                                    type="text"
                                    placeholder="MM/DD/YYYY"
                                    value={
                                        form.birthday
                                    }
                                    onChange={(e) =>
                                        update(
                                            "birthday",
                                            e.target.value,
                                        )
                                    }
                                />
                            </label>
                        </div>
                    </section>
                )}

                <section className="sale-card">
                    <h2>
                        Purchase Information
                    </h2>

                    <div className="sale-fields">
                        <label className="sale-field">
                            <span>
                                Perfume Name
                            </span>

                            <input
                                type="text"
                                placeholder="Enter perfume name"
                                value={
                                    form.perfume_name
                                }
                                onChange={(e) =>
                                    update(
                                        "perfume_name",
                                        e.target.value,
                                    )
                                }
                                required
                            />
                        </label>

                        <div className="sale-field">
                            <span>
                                Volume
                            </span>

                            <div className="volume-options">
                                {[
                                    "50",
                                    "100",
                                ].map(
                                    (volume) => (
                                        <button
                                            key={
                                                volume
                                            }
                                            type="button"
                                            className={`volume-option ${
                                                form.volume_ml ===
                                                volume
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                update(
                                                    "volume_ml",
                                                    volume,
                                                )
                                            }
                                        >
                                            {volume}
                                            ml
                                        </button>
                                    ),
                                )}

                                <button
                                    type="button"
                                    className={`volume-option ${
                                        form.volume_ml !==
                                            "50" &&
                                        form.volume_ml !==
                                            "100" &&
                                        form.volume_ml !==
                                            ""
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        update(
                                            "volume_ml",
                                            "",
                                        )
                                    }
                                >
                                    Custom
                                </button>
                            </div>

                            {form.volume_ml !==
                                "50" &&
                                form.volume_ml !==
                                    "100" && (
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Enter volume in ml"
                                        value={
                                            form.volume_ml
                                        }
                                        onChange={(e) =>
                                            update(
                                                "volume_ml",
                                                e.target
                                                    .value,
                                            )
                                        }
                                    />
                                )}
                        </div>

                        <label className="sale-field">
                            <span>
                                Price
                            </span>

                            <div className="sale-input-with-icon">
                                <span>UZS</span>

                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={
                                        form.price
                                    }
                                    onChange={(e) => {
                                        const value =
                                            e.target.value.replace(
                                                /[^0-9.]/g,
                                                "",
                                            );

                                        update(
                                            "price",
                                            value,
                                        );
                                    }}
                                    required
                                />
                            </div>
                        </label>

                        <label className="sale-field">
                            <span>
                                Comment
                            </span>

                            <textarea
                                rows={4}
                                placeholder="Add notes about this sale..."
                                value={
                                    form.comment
                                }
                                onChange={(e) =>
                                    update(
                                        "comment",
                                        e.target.value,
                                    )
                                }
                            />
                        </label>
                    </div>
                </section>

                <button
                    type="submit"
                    className="sale-save-button"
                    disabled={
                        mutation.isPending
                    }
                >
                    {mutation.isPending
                        ? "Saving..."
                        : "Save Sale"}
                </button>
            </form>
        );
    }

    return (
        <div className="create-sale">
            <header className="create-sale-header">
                <Link
                    to="/"
                    className="create-sale-back"
                    aria-label="Back"
                >
                    <img
                        src={arrowIcon}
                        alt=""
                        className="create-sale-back-icon"
                    />
                </Link>

                <h1>New Sale</h1>

                <Link
    to="/"
    className="create-sale-attor"
>
    ATTOR
</Link>
            </header>

            <div className="create-sale-line" />

            <section className="sale-step">
                <div className="sale-step-indicator">
                    <span className="sale-step-number active">
                        1
                    </span>

                    <span className="sale-step-title">
                        Phone Number
                    </span>

                    <span className="sale-step-divider" />

                    <span className="sale-step-number">
                        2
                    </span>

                    <span className="sale-step-title">
                        Purchase Info
                    </span>
                </div>

                <div className="sale-card">
                    <h2>
                        Customer phone or name
                    </h2>

                    <div className="sale-phone-field">
                        <span className="sale-phone-icon">
                        </span>

                        <input
                            type="text"
                            inputMode="search"
                            placeholder=""
                            value={search}
                            onChange={(e) => {
                                setSearch(
                                    e.target.value,
                                );

                                setIsNewCustomer(
                                    false,
                                );
                            }}
                        />
                    </div>

                    {search.trim().length >= 3 && (
                        <div className="sale-search-results">
                            {isLoading && (
                                <div className="sale-search-message">
                                    Searching...
                                </div>
                            )}

                            {!isLoading &&
                                data &&
                                data.length > 0 && (
                                    <div className="sale-existing-customer">
                                        <div
                                            className={`sale-status ${
                                                exactPhoneMatch
                                                    ? "existing"
                                                    : "matching"
                                            }`}
                                        >
                                            <span>
                                                {exactPhoneMatch
                                                    ? "✓"
                                                    : "⌕"}
                                            </span>

                                            <strong>
                                                {exactPhoneMatch
                                                    ? "Existing customer found"
                                                    : "Matching customers"}
                                            </strong>
                                        </div>

                                        <div className="sale-client-list">
                                            {data.map(
                                                (
                                                    client,
                                                ) => (
                                                    <button
                                                        key={
                                                            client.id
                                                        }
                                                        type="button"
                                                        className="sale-client-result"
                                                        onClick={() =>
                                                            selectExistingClient(
                                                                client,
                                                            )
                                                        }
                                                    >
                                                        <strong>
                                                            {
                                                                client.full_name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                client.phone
                                                            }
                                                        </span>
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {!isLoading &&
                                data &&
                                data.length ===
                                    0 && (
                                    <div className="sale-new-customer">
                                        <div className="sale-status new">
                                            <span>
                                                ⓘ
                                            </span>

                                            <strong>
                                                New customer
                                            </strong>
                                        </div>

                                        <p>
                                            No customer
                                            found with
                                            this search.
                                        </p>

                                        <button
                                            type="button"
                                            className="sale-primary-button"
                                            onClick={
                                                startNewCustomer
                                            }
                                        >
                                            Create Sale
                                        </button>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
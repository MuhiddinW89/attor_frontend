import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
    createSale,
    type CreateSaleRequest,
} from "../../services/sales/create-sale";

export default function CreateSaleForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
    full_name: "",
    phone: "",
    instagram: "",
    perfume_name: "",
    volume_ml: "",
    price: "",
    comment: "",
});

    const mutation = useMutation({
        mutationFn: createSale,

        onSuccess: () => {
            navigate("/");
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

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate({
    ...form,
    volume_ml: Number(form.volume_ml || 0),
    price: Number(form.price || 0),
});
            }}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
            }}
        >
            <Field label="Full Name">
                <input
                    value={form.full_name}
                    onChange={(e) =>
                        update("full_name", e.target.value)
                    }
                />
            </Field>

            <Field label="Phone">
                <input
                    value={form.phone}
                    onChange={(e) =>
                        update("phone", e.target.value)
                    }
                />
            </Field>

            <Field label="Instagram">
                <input
                    placeholder="@username"
                    value={form.instagram}
                    onChange={(e) =>
                        update("instagram", e.target.value)
                    }
                />
            </Field>

            <Field label="Perfume">
                <input
                    value={form.perfume_name}
                    onChange={(e) =>
                        update("perfume_name", e.target.value)
                    }
                />
            </Field>

            <div
                style={{
                    display: "flex",
                    gap: 16,
                }}
            >
                <Field label="Volume (ml)">
                    <input
    type="text"
    inputMode="numeric"
    placeholder=""
    value={form.volume_ml}
    onChange={(e) => {
        const value = e.target.value.replace(/\D/g, "");
        update("volume_ml", value);
    }}
/>
                </Field>

                <Field label="Price ($)">
                    <input
    type="text"
    inputMode="decimal"
    placeholder=""
    value={form.price}
    onChange={(e) => {
        const value = e.target.value.replace(/[^0-9.]/g, "");
        update("price", value);
    }}
/>
                </Field>
            </div>

            <Field label="Comment">
                <textarea
                    rows={4}
                    value={form.comment}
                    onChange={(e) =>
                        update("comment", e.target.value)
                    }
                />
            </Field>

            <button
                type="submit"
                disabled={mutation.isPending}
                style={{
                    padding: "14px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 16,
                }}
            >
                {mutation.isPending
                    ? "Saving..."
                    : "Save Sale"}
            </button>
        </form>
    );
}

type FieldProps = {
    label: string;
    children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                flex: 1,
            }}
        >
            <label
                style={{
                    fontWeight: 600,
                }}
            >
                {label}
            </label>

            {children}
        </div>
    );
}
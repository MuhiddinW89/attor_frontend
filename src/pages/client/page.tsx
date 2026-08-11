import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getClientHistory } from "../../services/clients/get-history";

export default function ClientPage() {
    const { id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ["client-history", id],
        queryFn: () => getClientHistory(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return <h1>Loading...</h1>;
    }

    if (error) {
        return <h1>Something went wrong.</h1>;
    }

    if (!data) {
        return <h1>Client not found.</h1>;
    }

    return (
        <div
            style={{
                maxWidth: 700,
                margin: "40px auto",
                fontFamily: "sans-serif",
            }}
        >
            <h1>{data.client.full_name}</h1>

            <p>
                <strong>Phone:</strong> {data.client.phone}
            </p>
            {data.client.instagram && (
    <p>
        <strong>Instagram:</strong> {data.client.instagram}
    </p>
)}
            <p>
                <strong>Total sales:</strong> {data.total_sales}
            </p>

            <p>
                <strong>Total amount:</strong> ${data.total_amount}
            </p>

            <hr />

            <h2>Sales history</h2>

            {data.sales.map((sale) => (
                <div
                    key={sale.id}
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12,
                    }}
                >
                    <h3>{sale.perfume_name}</h3>

                    <p>{sale.volume_ml} ml</p>

                    <p>${sale.price}</p>

                    {sale.comment && (
                        <p>
                            <strong>Comment:</strong> {sale.comment}
                        </p>
                    )}

                    <p>
                        {new Date(sale.sale_date).toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
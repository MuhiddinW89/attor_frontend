import { api } from "../api";

export interface Sale {
    id: string;
    perfume_name: string;
    volume_ml: number;
    price: number;
    comment?: string;
    sale_date: string;
}

export interface ClientHistory {
    client: {
        id: string;
        full_name: string;
        phone: string;
        instagram?: string;
    };

    total_sales: number;
    total_amount: number;

    sales: Sale[];

    reminder?: {
        id: string;
        reminder_at: string;
        is_sent: boolean;
    };
}

export async function getClientHistory(
    id: string,
): Promise<ClientHistory> {

    const response = await api.get<ClientHistory>(
        `/clients/${id}/history`,
    );

    return response.data;
}
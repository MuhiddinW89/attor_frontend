import { api } from "../api";

export interface ClientListStatsItem {
    id: string;
    full_name: string;
    phone: string;
    instagram?: string;
    total_sales: number;
    total_amount: number;
}

export async function getClients(
    search: string = "",
): Promise<ClientListStatsItem[]> {
    const response = await api.get<ClientListStatsItem[]>(
        "/clients/summary",
        {
            params: {
                search,
            },
        },
    );

    return response.data;
}
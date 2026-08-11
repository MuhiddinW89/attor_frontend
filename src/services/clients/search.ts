import { api } from "../api";

export interface ClientListItem {
    id: string;
    full_name: string;
    phone: string;
}

export async function searchClients(
    search: string,
): Promise<ClientListItem[]> {

    const response = await api.get<ClientListItem[]>("/clients", {
        params: {
            search,
        },
    });

    return response.data;
}
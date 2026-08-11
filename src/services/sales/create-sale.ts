import { api } from "../api";

export interface CreateSaleRequest {
    full_name: string;
    phone: string;
    instagram?: string;

    perfume_name: string;
    volume_ml: number;
    price: number;

    comment?: string;
}

export async function createSale(
    request: CreateSaleRequest,
) {
    const response = await api.post("/sales", request);

    return response.data;
}
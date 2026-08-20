import { api } from "../api";

export interface AnalyticsFilters {
    year?: number;
    month?: number;
    week?: number;
    day?: number;
}

export interface RevenuePoint {
    label: string;
    revenue: number;
    sales: number;
}

export interface PerfumeStat {
    perfume_name: string;
    sales: number;
    revenue: number;
}

export interface CustomerStat {
    client_id: string;
    full_name: string;
    sales: number;
    revenue: number;
}

export interface Analytics {
    total_revenue: number;
    total_sales: number;
    average_purchase: number;
    total_clients: number;
    repeat_rate: number;
    repeat_customers: number;

    revenue_overview: RevenuePoint[];
    top_perfumes: PerfumeStat[];
    top_customers: CustomerStat[];
    key_insights: string[];
}

export async function getAnalytics(
    filters: AnalyticsFilters = {},
): Promise<Analytics> {
    const response = await api.get<Analytics>("/analytics", {
        params: filters,
    });

    return response.data;
}
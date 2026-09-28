import { api } from "../api";

export interface Reminder {
    id: string;
    client_id: string;
    client_name: string;
    phone: string;
    perfume_name: string;
    volume_ml: number;
    price: number;
    comment: string;
    sale_date: string;
    reminder_at: string;
    is_sent: boolean;
}

export type ReminderStatus =
    | "all"
    | "urgent"
    | "overdue"
    | "completed";

export async function getReminders(
    status: ReminderStatus = "all",
): Promise<Reminder[]> {
    const response = await api.get<Reminder[]>("/reminders", {
        params: {
            status,
        },
    });

    return response.data;
}
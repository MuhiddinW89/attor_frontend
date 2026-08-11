import { api } from "../api";

export async function markReminderSent(id: string) {
    await api.patch(`/reminders/${id}/sent`);
}
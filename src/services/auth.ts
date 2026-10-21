import axios from "axios";
import { api } from "./api";

export type UserRole = "owner" | "employee";

export function getAuthErrorMessage(error: unknown) {
    if (axios.isAxiosError<{ error?: string }>(error)) {
        return error.response?.data?.error ?? "Unable to connect to the server.";
    }
    return error instanceof Error
        ? error.message
        : "Unable to complete the request.";
}

export interface CurrentUser {
    user_id: string;
    store_id: string;
    role: UserRole;
    expires_at: string;
}

interface LoginResponse {
    user_id: string;
    store_id: string;
    email: string;
    role: UserRole;
    csrf_token: string;
}

export async function login(email: string, password: string) {
    const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
    });
    return response.data;
}

export async function getCurrentUser(): Promise<CurrentUser> {
    const response = await api.get<CurrentUser>("/auth/me");
    const user = response.data;

    if (
        !user.user_id ||
        !user.store_id ||
        !["owner", "employee"].includes(user.role)
    ) {
        throw new Error("The server returned an invalid user session.");
    }

    return user;
}

export async function logout() {
    await api.post("/auth/logout");
}

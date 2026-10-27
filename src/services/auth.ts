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

interface MessageResponse {
    message: string;
}

interface VerificationResponse {
    completion_token: string;
}

export async function login(email: string, password: string) {
    const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
    });
    return response.data;
}

export async function registerOwner(email: string, password: string, turnstileToken: string) {
    if (!turnstileToken.trim()) {
        throw new Error("Complete the security check before creating an account.");
    }
    const response = await api.post<MessageResponse>("/auth/register", {
        email,
        password,
        turnstile_token: turnstileToken,
    });
    return response.data;
}

export async function verifyOwnerEmail(token: string) {
    const response = await api.post<VerificationResponse>("/auth/verify-email", {
        token,
    });
    return response.data;
}

export async function resendVerification(email: string) {
    const response = await api.post<MessageResponse>("/auth/resend-verification", {
        email,
    });
    return response.data;
}

export async function completeOwnerRegistration(
    completionToken: string,
    storeName: string,
) {
    const response = await api.post<MessageResponse>(
        "/auth/complete-owner-registration",
        { completion_token: completionToken, store_name: storeName },
    );
    return response.data;
}

export async function requestPasswordReset(email: string) {
    const response = await api.post<MessageResponse>("/auth/forgot-password", {
        email,
    });
    return response.data;
}

export async function resetPassword(token: string, password: string) {
    await api.post("/auth/reset-password", { token, password });
}

export async function acceptEmployeeInvitation(token: string, password: string) {
    const response = await api.post<MessageResponse>("/auth/accept-invitation", {
        token,
        password,
    });
    return response.data;
}

export async function inviteEmployee(email: string) {
    const response = await api.post<MessageResponse>("/employees/invitations", {
        email,
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

import axios from "axios";

const csrfStorageKey = "attor_csrf_token";
const unauthorizedEvent = "attor:unauthorized";
let csrfToken: string | null = null;

function getCSRFToken() {
    if (csrfToken === null && typeof window !== "undefined") {
        csrfToken = window.sessionStorage.getItem(csrfStorageKey);
    }
    return csrfToken;
}

export function setCSRFToken(token: string) {
    csrfToken = token;
    window.sessionStorage.setItem(csrfStorageKey, token);
}

export function clearCSRFToken() {
    csrfToken = null;
    if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(csrfStorageKey);
    }
}

const defaultApiUrl = import.meta.env.DEV
    ? "http://localhost:8080/api/v1"
    : "https://attor-backend-ho0o.onrender.com/api/v1";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const method = config.method?.toUpperCase();
    const csrf = getCSRFToken();

    if (
        csrf &&
        ["POST", "PUT", "PATCH", "DELETE"].includes(method ?? "") &&
        !config.url?.endsWith("/auth/login")
    ) {
        config.headers.set("X-CSRF-Token", csrf);
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            typeof window !== "undefined"
        ) {
            clearCSRFToken();
            window.dispatchEvent(new Event(unauthorizedEvent));
        }
        return Promise.reject(error);
    },
);

export { unauthorizedEvent };

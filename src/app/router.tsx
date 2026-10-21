import { createBrowserRouter } from "react-router-dom";

import App from "./App.tsx";

import DashboardPage from "../pages/dashboard/page";
import RemindersPage from "../pages/reminders/page";
import ClientPage from "../pages/client/page";
import ClientsListPage from "../pages/clients-list/page";
import SalesPage from "../pages/sales/page";
import AnalyticsPage from "../pages/analytics/page";
import EmployeeDashboardPage from "../pages/employee/page";
import LoginPage from "../pages/login/page";
import EmployeesPage from "../pages/owner/employees";
import {
    LegacyRoute,
    RequireRole,
    RoleHomeRedirect,
} from "./protected-route";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "owner",
                element: <RequireRole role="owner" />,
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: "analytics", element: <AnalyticsPage /> },
                    { path: "employees", element: <EmployeesPage /> },
                    { path: "clients", element: <ClientsListPage /> },
                    { path: "clients/:id", element: <ClientPage /> },
                    { path: "sales/new", element: <SalesPage /> },
                    { path: "reminders", element: <RemindersPage /> },
                ],
            },
            {
                path: "employee",
                element: <RequireRole role="employee" />,
                children: [
                    { index: true, element: <EmployeeDashboardPage /> },
                    { path: "clients", element: <ClientsListPage /> },
                    { path: "clients/:id", element: <ClientPage /> },
                    { path: "sales/new", element: <SalesPage /> },
                    { path: "reminders", element: <RemindersPage /> },
                ],
            },
            {
                index: true,
                element: <RoleHomeRedirect />,
            },
            {
                path: "clients",
                element: <LegacyRoute destination="clients" />,
            },
            {
                path: "clients/:id",
                element: <LegacyRoute destination="clients/:id" />,
            },
            {
                path: "sales/new",
                element: <LegacyRoute destination="sales/new" />,
            },
            {
                path: "reminders",
                element: <LegacyRoute destination="reminders" />,
            },
            {
                path: "analytics",
                element: <LegacyRoute destination="analytics" />,
            },
        ],
    },
]);
import { createBrowserRouter } from "react-router-dom";

import App from "./App.tsx";

import DashboardPage from "../pages/dashboard/page";
import RemindersPage from "../pages/reminders/page";
import ClientPage from "../pages/client/page";
import ClientsListPage from "../pages/clients-list/page";
import SalesPage from "../pages/sales/page";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: "clients",
                element: <ClientsListPage />,
            },
            {
                path: "clients/:id",
                element: <ClientPage />,
            },
            {
                path: "sales/new",
                element: <SalesPage />,
            },
            {
                path: "reminders",
                element: <RemindersPage />,
            },
        ],
    },
]);
import { createBrowserRouter } from "react-router-dom";

import App from "./App.tsx";

import RemindersPage from "../pages/reminders/page";
import ClientPage from "../pages/client/page";
import SalesPage from "../pages/sales/page";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <RemindersPage />,
            },
            {
                path: "clients/:id",
                element: <ClientPage />,
            },
            {
                path: "sales/new",
                element: <SalesPage />,
            },
        ],
    },
]);
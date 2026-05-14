import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { AppShell } from "./layout/AppShell";
import { LoginPage } from "./pages/auth/LoginPage";
import { AuthLayout } from "./layout/AuthLayout";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { MainLayout } from "./layout/MainLayout";
import { OverviewPage } from "./pages/overview/OverviewPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { paths } from "./config/paths";
import { ExpensesFormPage } from "./pages/expenses/ExpensesFormPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { StoresPage } from "./pages/stores/StoresPage";
import { StoresFormPage } from "./pages/stores/StoresFormPage";
import { MenuPage } from "./pages/menu/MenuPage";
import { CategoriesFormPage } from "./pages/menu/CategoriesFormPage";
import { MenuItemsFormPage } from "./pages/menu/MenuItemsFormPage";
import { CategoriesReorderPage } from "./pages/menu/CategoriesReorderPage";
import { AreasPage } from "./pages/areas/AreasPage";
import { AreasFormPage } from "./pages/areas/AreasFormPage";
import { TablesFormPage } from "./pages/areas/TablesFormPage";
import { ReorderAreasPage } from "./pages/areas/ReorderAreasPage";
import { StatusesPage } from "./pages/statuses/StatusesPage";
import { StatusesFormPage } from "./pages/statuses/StatusesFormPage";
import { ReorderStatusesPage } from "./pages/statuses/ReorderStatusesPage";
import { OrdersPage } from "./pages/orders/OrdersPage";
import { SelectTablePage } from "./pages/orders/SelectTablePage";
import { SelectMenuPage } from "./pages/orders/SelectMenuPage";
import { SummaryOrderPage } from "./pages/orders/SummaryOrderPage";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: paths.auth.login,
            element: <LoginPage />
          },
          {
            path: paths.auth.register,
            element: <RegisterPage />
          }
        ]
      },
      {
        element: <MainLayout />,
        children: [
          {
            path: paths.overview.index,
            element: <OverviewPage />
          },
          // Expenses
          {
            path: paths.expenses.index,
            element: <ExpensesPage />
          },
          {
            path: paths.expenses.edit(":id"),
            element: <ExpensesFormPage type="edit" />
          },
          {
            path: paths.expenses.create,
            element: <ExpensesFormPage type="create" />
          },
          // Settings
          {
            path: paths.settings.index,
            element: <SettingsPage />
          },
          // Stores
          {
            path: paths.stores.index,
            element: <StoresPage />
          },
          {
            path: paths.stores.create,
            element: <StoresFormPage type="create" />
          },
          {
            path: paths.stores.edit(":id"),
            element: <StoresFormPage type="edit" />
          },
          // Menu
          {
            path: paths.menu.index,
            element: <MenuPage />
          },
          {
            path: paths.menu.categories.create,
            element: <CategoriesFormPage type="create" />
          },
          {
            path: paths.menu.categories.edit(":id"),
            element: <CategoriesFormPage type="edit" />
          },
          {
            path: paths.menu.items.create,
            element: <MenuItemsFormPage type="create" />
          },
          {
            path: paths.menu.items.edit(":id"),
            element: <MenuItemsFormPage type="edit" />
          },
          {
            path: paths.menu.categories.reorder,
            element: <CategoriesReorderPage />
          },
          // Areas
          {
            path: paths.areas.index,
            element: <AreasPage />
          },
          {
            path: paths.areas.create,
            element: <AreasFormPage type="create" />
          },
          {
            path: paths.areas.edit(":id"),
            element: <AreasFormPage type="edit" />
          },
          {
            path: paths.areas.reorder,
            element: <ReorderAreasPage />
          },
          {
            path: paths.areas.tables.edit(":id"),
            element: <TablesFormPage type="edit" />
          },
          // Statuses
          {
            path: paths.statuses.index,
            element: <StatusesPage />
          },
          {
            path: paths.statuses.create,
            element: <StatusesFormPage type="create" />
          },
          {
            path: paths.statuses.edit(":id"),
            element: <StatusesFormPage type="edit" />
          },
          {
            path: paths.statuses.reorder,
            element: <ReorderStatusesPage />
          },
          // Orders
          {
            path: paths.orders.index,
            element: <OrdersPage />
          },
          {
            path: paths.orders.selectTable,
            element: <SelectTablePage />
          },
          {
            path: paths.orders.selectMenu,
            element: <SelectMenuPage />
          },
          {
            path: paths.orders.summary,
            element: <SummaryOrderPage />
          },
        ]
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
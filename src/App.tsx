import { QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { queryClient } from '@/lib/queryClient';

import { AppShell } from "./layout/AppShell";
import { SplashLayout } from "./layout/SplashLayout";
import { StoreGuardLayout } from "./layout/StoreGuardLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { AuthLayout } from "./layout/AuthLayout";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { MainLayout } from "./layout/MainLayout";
import { OverviewPage } from "./pages/overview/OverviewPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { paths } from "./config/paths";
import { ExpensesFormPage } from "./pages/expenses/ExpensesFormPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { EmployeesPage } from "./pages/employees/EmployeesPage";
import { EmployeeFormPage } from "./pages/employees/EmployeeFormPage";
import { RolesPage } from "./pages/roles/RolesPage";
import { RolesFormPage } from "./pages/roles/RolesFormPage";
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
import { OrderFormPage } from "./pages/orders/OrderFormPage";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        element: <SplashLayout />,
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
            element: <StoreGuardLayout />,
            children: [
              {
                element: <MainLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to={paths.overview.index} replace />
                  },
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
                  // Employees
                  {
                    path: paths.employees.index,
                    element: <EmployeesPage />
                  },
                  {
                    path: paths.employees.create,
                    element: <EmployeeFormPage type="create" />
                  },
                  {
                    path: paths.employees.edit(":id"),
                    element: <EmployeeFormPage type="edit" />
                  },
                  // Roles
                  {
                    path: paths.roles.index,
                    element: <RolesPage />
                  },
                  {
                    path: paths.roles.create,
                    element: <RolesFormPage type="create" />
                  },
                  {
                    path: paths.roles.edit(":id"),
                    element: <RolesFormPage type="edit" />
                  },
                  // Stores
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
                    element: <OrderFormPage />
                  },
                ]
              },
            ],
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
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
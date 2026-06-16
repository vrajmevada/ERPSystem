import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthGuard from 'components/AuthGuard';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const ProductsPage = Loadable(
  lazy(() => import('pages/products/ProductsPage'))
);

// render - placeholders
const CategoriesPage = Loadable(lazy(() => import('pages/placeholder/CategoriesPage')));
const CustomersPage = Loadable(lazy(() => import('pages/placeholder/CustomersPage')));
const SuppliersPage = Loadable(lazy(() => import('pages/placeholder/SuppliersPage')));
const WarehousesPage = Loadable(lazy(() => import('pages/placeholder/WarehousesPage')));
const TransactionsPage = Loadable(lazy(() => import('pages/placeholder/TransactionsPage')));
const PurchaseOrdersPage = Loadable(lazy(() => import('pages/placeholder/PurchaseOrdersPage')));
const SalesOrdersPage = Loadable(lazy(() => import('pages/placeholder/SalesOrdersPage')));
const AuditLogsPage = Loadable(lazy(() => import('pages/placeholder/AuditLogsPage')));
const ProfilePage = Loadable(lazy(() => import('pages/profile')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'products',
      element: <ProductsPage/>
    },
    {
      path: 'categories',
      element: <CategoriesPage />
    },
    {
      path: 'customers',
      element: <CustomersPage />
    },
    {
      path: 'suppliers',
      element: <SuppliersPage />
    },
    {
      path: 'warehouses',
      element: <WarehousesPage />
    },
    {
      path: 'transactions',
      element: <TransactionsPage />
    },
    {
      path: 'purchase-orders',
      element: <PurchaseOrdersPage />
    },
    {
      path: 'sales-orders',
      element: <SalesOrdersPage />
    },
    {
      path: 'audit-logs',
      element: <AuditLogsPage />
    },
    {
      path: 'profile',
      element: <ProfilePage />
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    }
  ]
};

export default MainRoutes;

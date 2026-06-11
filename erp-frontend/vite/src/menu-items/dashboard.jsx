// assets
import { DashboardOutlined, BarcodeOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  BarcodeOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'products',
      title: 'Products',
      type: 'item',
      url: '/products',
      icon: icons.BarcodeOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;

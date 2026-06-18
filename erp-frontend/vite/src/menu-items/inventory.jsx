// assets
import {
  DatabaseOutlined,
  SwapOutlined,
  PlusSquareOutlined,
  LoginOutlined,
  LogoutOutlined,
  LineChartOutlined,
  BarChartOutlined,
  HistoryOutlined
} from '@ant-design/icons';

// icons
const icons = {
  DatabaseOutlined,
  SwapOutlined,
  PlusSquareOutlined,
  LoginOutlined,
  LogoutOutlined,
  LineChartOutlined,
  BarChartOutlined,
  HistoryOutlined
};

// ==============================|| MENU ITEMS - INVENTORY ||============================== //

const inventory = {
  id: 'inventory',
  title: 'Inventory',
  type: 'group',
  children: [
    {
      id: 'warehouses',
      title: 'Warehouses',
      type: 'item',
      url: '/warehouses',
      icon: icons.DatabaseOutlined,
      breadcrumbs: false
    },
    {
      id: 'transactions',
      title: 'Transactions',
      type: 'item',
      url: '/transactions',
      icon: icons.SwapOutlined,
      breadcrumbs: false
    },
    {
      id: 'opening-stock',
      title: 'Opening Stock',
      type: 'item',
      url: '/inventory/opening-stock',
      icon: icons.PlusSquareOutlined,
      breadcrumbs: false
    },
    {
      id: 'material-inward',
      title: 'Material Inward',
      type: 'item',
      url: '/inventory/material-inward',
      icon: icons.LoginOutlined,
      breadcrumbs: false
    },
    {
      id: 'material-outward',
      title: 'Material Outward',
      type: 'item',
      url: '/inventory/material-outward',
      icon: icons.LogoutOutlined,
      breadcrumbs: false
    },
    {
      id: 'stock-report',
      title: 'Stock Report',
      type: 'item',
      url: '/inventory/stock-report',
      icon: icons.LineChartOutlined,
      breadcrumbs: false
    },
    {
      id: 'stock-summary',
      title: 'Stock Summary',
      type: 'item',
      url: '/inventory/stock-summary',
      icon: icons.BarChartOutlined,
      breadcrumbs: false
    },
    {
      id: 'tracking-detail',
      title: 'Tracking Detail',
      type: 'item',
      url: '/inventory/tracking-detail',
      icon: icons.HistoryOutlined,
      breadcrumbs: false
    }
  ]
};

export default inventory;

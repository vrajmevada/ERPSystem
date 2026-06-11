// assets
import { DatabaseOutlined, SwapOutlined } from '@ant-design/icons';

// icons
const icons = {
  DatabaseOutlined,
  SwapOutlined
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
    }
  ]
};

export default inventory;

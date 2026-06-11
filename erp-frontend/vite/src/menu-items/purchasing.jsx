// assets
import { ShoppingCartOutlined } from '@ant-design/icons';

// icons
const icons = {
  ShoppingCartOutlined
};

// ==============================|| MENU ITEMS - PURCHASING ||============================== //

const purchasing = {
  id: 'purchasing',
  title: 'Purchasing',
  type: 'group',
  children: [
    {
      id: 'purchase-orders',
      title: 'Purchase Orders',
      type: 'item',
      url: '/purchase-orders',
      icon: icons.ShoppingCartOutlined,
      breadcrumbs: false
    }
  ]
};

export default purchasing;

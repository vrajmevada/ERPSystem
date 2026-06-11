// assets
import { FileDoneOutlined } from '@ant-design/icons';

// icons
const icons = {
  FileDoneOutlined
};

// ==============================|| MENU ITEMS - SALES ||============================== //

const sales = {
  id: 'sales',
  title: 'Sales',
  type: 'group',
  children: [
    {
      id: 'sales-orders',
      title: 'Sales Orders',
      type: 'item',
      url: '/sales-orders',
      icon: icons.FileDoneOutlined,
      breadcrumbs: false
    }
  ]
};

export default sales;

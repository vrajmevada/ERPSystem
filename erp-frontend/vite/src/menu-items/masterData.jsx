// assets
import { TagsOutlined, BarcodeOutlined, UserOutlined, TruckOutlined } from '@ant-design/icons';

// icons
const icons = {
  TagsOutlined,
  BarcodeOutlined,
  UserOutlined,
  TruckOutlined
};

// ==============================|| MENU ITEMS - MASTER DATA ||============================== //

const masterData = {
  id: 'master-data',
  title: 'Master Data',
  type: 'group',
  children: [
    {
      id: 'categories',
      title: 'Categories',
      type: 'item',
      url: '/categories',
      icon: icons.TagsOutlined,
      breadcrumbs: false
    },
    {
      id: 'products',
      title: 'Products',
      type: 'item',
      url: '/products',
      icon: icons.BarcodeOutlined,
      breadcrumbs: false
    },
    {
      id: 'customers',
      title: 'Customers',
      type: 'item',
      url: '/customers',
      icon: icons.UserOutlined,
      breadcrumbs: false
    },
    {
      id: 'suppliers',
      title: 'Suppliers',
      type: 'item',
      url: '/suppliers',
      icon: icons.TruckOutlined,
      breadcrumbs: false
    }
  ]
};

export default masterData;

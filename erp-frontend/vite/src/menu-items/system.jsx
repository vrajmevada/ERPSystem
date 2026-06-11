// assets
import { HistoryOutlined } from '@ant-design/icons';

// icons
const icons = {
  HistoryOutlined
};

// ==============================|| MENU ITEMS - SYSTEM ||============================== //

const system = {
  id: 'system',
  title: 'System',
  type: 'group',
  children: [
    {
      id: 'audit-logs',
      title: 'Audit Logs',
      type: 'item',
      url: '/audit-logs',
      icon: icons.HistoryOutlined,
      breadcrumbs: false
    }
  ]
};

export default system;

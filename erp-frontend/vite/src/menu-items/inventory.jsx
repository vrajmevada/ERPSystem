// assets
import {
  DatabaseOutlined,
  SwapOutlined,
  PlusSquareOutlined,
  FileTextOutlined,
  NodeIndexOutlined,
  LineChartOutlined
} from '@ant-design/icons';

// icons
const icons = {
  DatabaseOutlined,
  SwapOutlined,
  PlusSquareOutlined,
  FileTextOutlined,
  NodeIndexOutlined,
  LineChartOutlined
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
      id: 'inventory-ops',
      title: 'Inventory Operations',
      type: 'collapse',
      icon: icons.PlusSquareOutlined,
      children: [
        {
          id: 'opening-stock',
          title: 'Opening Stock',
          type: 'item',
          url: '/inventory/opening-stock',
          breadcrumbs: false
        },
        {
          id: 'material-inward',
          title: 'Material Inward',
          type: 'item',
          url: '/inventory/material-inward',
          breadcrumbs: false
        },
        {
          id: 'material-outward',
          title: 'Material Outward',
          type: 'item',
          url: '/inventory/material-outward',
          breadcrumbs: false
        },
        {
          id: 'grn-approval',
          title: 'GRN Store Approval',
          type: 'item',
          url: '/inventory/grn-approval',
          breadcrumbs: false
        },
        {
          id: 'stock-conversions',
          title: 'Stock Conversion',
          type: 'item',
          url: '/inventory/stock-conversions',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'indents-requests',
      title: 'Indents & Requests',
      type: 'collapse',
      icon: icons.FileTextOutlined,
      children: [
        {
          id: 'indents',
          title: 'Indent',
          type: 'item',
          url: '/inventory/indents',
          breadcrumbs: false
        },
        {
          id: 'indent-short-close',
          title: 'Indent Short Close',
          type: 'item',
          url: '/inventory/indent-short-close',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'transfers-deliveries',
      title: 'Transfers & Deliveries',
      type: 'collapse',
      icon: icons.NodeIndexOutlined,
      children: [
        {
          id: 'transfer-slips',
          title: 'Transfer Slip',
          type: 'item',
          url: '/inventory/transfer-slips',
          breadcrumbs: false
        },
        {
          id: 'transfer-slip-cancellation',
          title: 'Transfer Slip Cancel',
          type: 'item',
          url: '/inventory/transfer-slip-cancellation',
          breadcrumbs: false
        },
        {
          id: 'delivery-challans',
          title: 'Delivery Challan',
          type: 'item',
          url: '/inventory/delivery-challans',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'inventory-reports',
      title: 'Inventory Reports',
      type: 'collapse',
      icon: icons.LineChartOutlined,
      children: [
        {
          id: 'stock-report',
          title: 'Stock Report',
          type: 'item',
          url: '/inventory/stock-report',
          breadcrumbs: false
        },
        {
          id: 'stock-summary',
          title: 'Stock Summary',
          type: 'item',
          url: '/inventory/stock-summary',
          breadcrumbs: false
        },
        {
          id: 'tracking-detail',
          title: 'Tracking Detail',
          type: 'item',
          url: '/inventory/tracking-detail',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default inventory;

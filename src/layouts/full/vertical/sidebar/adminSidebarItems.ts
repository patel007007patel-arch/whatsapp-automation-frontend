import { uniqueId } from 'lodash';
import { MenuItem } from './sidebaritems';

const AdminSidebarContent: MenuItem[] = [
  {
    heading: 'Dashboard',
    children: [
      {
        name: 'Dashboard',
        icon: 'solar:widget-2-linear',
        id: uniqueId(),
        url: '/admin/dashboard',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Management',
    children: [
      {
        name: 'Users',
        icon: 'solar:users-group-rounded-linear',
        id: uniqueId(),
        url: '/admin/users',
        isPro: false,
      },
      {
        name: 'Plans',
        icon: 'solar:tag-price-linear',
        id: uniqueId(),
        url: '/admin/plans',
        isPro: false,
      },
      {
        name: 'Plan Requests',
        icon: 'solar:document-add-linear',
        id: uniqueId(),
        url: '/admin/plan-requests',
        isPro: false,
      },
      {
        name: 'WhatsApp Sessions',
        icon: 'solar:qr-code-linear',
        id: uniqueId(),
        url: '/admin/whatsapp-sessions',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Logs & Reports',
    children: [
      {
        name: 'Message Logs',
        icon: 'solar:document-linear',
        id: uniqueId(),
        url: '/admin/messages',
        isPro: false,
      },
      {
        name: 'Payments',
        icon: 'solar:bill-list-linear',
        id: uniqueId(),
        url: '/admin/payments',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Settings',
    children: [
      {
        name: 'Settings',
        icon: 'solar:settings-minimalistic-linear',
        id: uniqueId(),
        url: '/admin/settings',
        isPro: false,
      },
    ],
  },
];

export default AdminSidebarContent;


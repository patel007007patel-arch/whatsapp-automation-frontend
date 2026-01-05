import { uniqueId } from 'lodash';
import { MenuItem } from './sidebaritems';

const UserSidebarContent: MenuItem[] = [
  {
    heading: 'Dashboard',
    children: [
      {
        name: 'Dashboard',
        icon: 'solar:widget-2-linear',
        id: uniqueId(),
        url: '/user/dashboard',
        isPro: false,
      },
    ],
  },
  {
    heading: 'WhatsApp',
    children: [
      {
        name: 'Plans',
        icon: 'solar:tag-price-linear',
        id: uniqueId(),
        url: '/user/plans',
        isPro: false,
      },
      {
        name: 'Connect WhatsApp',
        icon: 'solar:qr-code-linear',
        id: uniqueId(),
        url: '/user/whatsapp/connect',
        isPro: false,
      },
      {
        name: 'API Keys',
        icon: 'solar:key-linear',
        id: uniqueId(),
        url: '/user/api-keys',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Messaging',
    children: [
      {
        name: 'Send Message',
        icon: 'solar:chat-round-linear',
        id: uniqueId(),
        url: '/user/messages/send',
        isPro: false,
      },
      {
        name: 'CSV Upload',
        icon: 'solar:document-add-linear',
        id: uniqueId(),
        url: '/user/csv',
        isPro: false,
      },
      {
        name: 'Message Logs',
        icon: 'solar:document-linear',
        id: uniqueId(),
        url: '/user/messages/logs',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Account',
    children: [
      {
        name: 'Billing',
        icon: 'solar:bill-list-linear',
        id: uniqueId(),
        url: '/user/billing',
        isPro: false,
      },
      {
        name: 'Settings',
        icon: 'solar:settings-minimalistic-linear',
        id: uniqueId(),
        url: '/user/settings',
        isPro: false,
      },
    ],
  },
];

export default UserSidebarContent;


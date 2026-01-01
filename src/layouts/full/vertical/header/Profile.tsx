'use client';

import { Icon } from '@iconify/react';
import SimpleBar from 'simplebar-react';
import { Link, useNavigate, useLocation } from 'react-router';
import profileimg from 'src/assets/images/profile/user-1.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { Button } from 'src/components/ui/button';
import { useEffect, useState } from 'react';
import { authAPI } from 'src/services/api';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authAPI.getMe();
        setUser(data.user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (isAdmin) {
      navigate('/auth/admin/login');
    } else {
      navigate('/auth/auth2/login');
    }
  };

  const settingsUrl = isAdmin ? '/admin/settings' : '/user/settings';

  // Profile menu items based on role
  const profileMenuItems = isAdmin
    ? [
        {
          title: 'Settings',
          subtitle: 'Admin settings',
          icon: 'solar:settings-minimalistic-linear',
          url: settingsUrl,
        },
      ]
    : [
        {
          title: 'Settings',
          subtitle: 'Account settings',
          icon: 'solar:settings-minimalistic-linear',
          url: settingsUrl,
        },
        {
          title: 'Billing',
          subtitle: 'Billing & usage',
          icon: 'solar:bill-list-linear',
          url: '/user/billing',
        },
      ];

  return (
    <div className="relative group/menu ps-1 sm:ps-15 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <img src={profileimg} alt="logo" height="35" width="35" className="rounded-full" />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-screen sm:w-[200px] pb-6 pt-4 rounded-sm"
        >
          {user && (
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
          <SimpleBar>
            {profileMenuItems.map((item, index) => (
              <DropdownMenuItem
                key={index}
                asChild
                className="px-4 py-2 flex justify-between items-center bg-hover group/link w-full cursor-pointer"
              >
                <Link to={item.url}>
                  <div className="w-full">
                    <div className="ps-0 flex items-center gap-3 w-full">
                      <Icon
                        icon={item.icon}
                        className="text-lg text-muted-foreground group-hover/link:text-primary"
                      />
                      <div className="w-3/4">
                        <h5 className="mb-0 text-sm text-muted-foreground group-hover/link:text-primary">
                          {item.title}
                        </h5>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </SimpleBar>

          <DropdownMenuSeparator className='my-2' />

          <div className="pt-2 px-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full rounded-md"
            >
              Logout
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Profile;

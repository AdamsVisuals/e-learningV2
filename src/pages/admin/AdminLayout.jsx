
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookMarked, Users, BarChart3, Settings, MessageSquare, Palette, Zap } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/courses', label: 'Courses', icon: BookMarked },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/feedback', label: 'Feedback (BETA)', icon: MessageSquare },
    { to: '/admin/ai-tools', label: 'AI Tools (BETA)', icon: Zap },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)]">
      <aside className="w-full md:w-64 bg-card border-r p-4 md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
        <ScrollArea className="h-full pr-3">
          <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="flex-1 p-6 md:p-8 overflow-auto"
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

export default AdminLayout;
  
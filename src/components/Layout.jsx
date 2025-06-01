
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpenText, Home, LogIn, LogOut, Moon, Sun, UserPlus, UserCircle, Settings, LayoutDashboard } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

const Layout = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/30 dark:from-background dark:to-secondary/20">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition-opacity">
            <BookOpenText size={28} />
            <span className="font-bold text-xl tracking-tight">LearnPremium</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/"><Home className="mr-2 h-4 w-4" />Home</Link>
            </Button>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" asChild>
                    <Link to="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Dashboard</Link>
                  </Button>
                )}
                {isStudent && (
                  <Button variant="ghost" asChild>
                    <Link to="/student"><LayoutDashboard className="mr-2 h-4 w-4" />My Dashboard</Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || 'User'} />
                        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isStudent && (
                       <DropdownMenuItem onClick={() => navigate('/student/profile')}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    )}
                     <DropdownMenuItem onClick={() => navigate(isAdmin ? '/admin/settings' : '/student/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register"><UserPlus className="mr-2 h-4 w-4" />Register</Link>
                </Button>
              </>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="theme-mode"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label="Toggle theme"
              />
              <Label htmlFor="theme-mode" className="cursor-pointer">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </Label>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <Outlet />
        </motion.div>
      </main>
      <footer className="border-t bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto py-6 px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} LearnPremium. All rights reserved.</p>
          <p>Powered by Adams+</p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Layout;
  

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-15rem)] py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        className="p-6 bg-destructive/10 rounded-full mb-8"
      >
        <AlertTriangle className="h-24 w-24 text-destructive" />
      </motion.div>
      <h1 className="text-6xl font-extrabold text-foreground mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-foreground mb-6">Oops! Page Not Found</h2>
      <p className="text-lg text-muted-foreground max-w-md mb-10">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
        <Link to="/">
          <Home className="mr-2 h-5 w-5" />
          Go to Homepage
        </Link>
      </Button>
    </motion.div>
  );
};

export default NotFoundPage;
  

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage = () => {
  const featureCards = [
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "Expert-Led Courses",
      description: "Learn from industry professionals with curated content and practical examples.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Interactive Community",
      description: "Connect with fellow learners, share insights, and grow together in a supportive environment.",
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Flexible Learning",
      description: "Access courses anytime, anywhere, and learn at your own pace on any device.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      <section className="text-center py-16 md:py-24 bg-gradient-to-b from-primary/10 to-transparent rounded-xl">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6"
        >
          Unlock Your Potential with <span className="text-primary">LearnPremium</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Discover a world of knowledge with our cutting-edge e-learning platform. High-quality courses, expert instructors, and a vibrant community await you.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center space-x-4"
        >
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform">
            <Link to="/register">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="shadow-lg transform hover:scale-105 transition-transform">
            <Link to="/student/courses">
              Browse Courses
            </Link>
          </Button>
        </motion.div>
      </section>

      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose LearnPremium?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {featureCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index + 0.5 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300 bg-card/50 dark:bg-card/70 backdrop-blur-sm">
                <CardHeader className="items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {card.icon}
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>{card.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Ready to Start Your Learning Journey?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of learners who are advancing their careers and enriching their lives with LearnPremium.
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform">
            <Link to="/register">
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Featured Courses</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
              <img  alt="Web Development Course Thumbnail" class="object-cover w-full h-full rounded-t-lg" src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6" />
            </div>
            <CardHeader>
              <CardTitle>Modern Web Development Bootcamp</CardTitle>
              <CardDescription>Master React, Node.js, and more.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link to="/student/courses/web-dev">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
              <img  alt="Data Science Course Thumbnail" class="object-cover w-full h-full rounded-t-lg" src="https://images.unsplash.com/photo-1686061593213-98dad7c599b9" />
            </div>
            <CardHeader>
              <CardTitle>Data Science & Machine Learning</CardTitle>
              <CardDescription>Unlock insights from data with Python.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link to="/student/courses/data-science">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
              <img  alt="UX Design Course Thumbnail" class="object-cover w-full h-full rounded-t-lg" src="https://images.unsplash.com/photo-1629752187687-3d3c7ea3a21b" />
            </div>
            <CardHeader>
              <CardTitle>Ultimate UX/UI Design Course</CardTitle>
              <CardDescription>Create stunning and user-friendly interfaces.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link to="/student/courses/ux-design">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

    </motion.div>
  );
};

export default HomePage;
  
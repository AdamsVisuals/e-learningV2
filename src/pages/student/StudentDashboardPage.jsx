import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpenText, PlayCircle, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    name: user?.name || 'Student',
    activeCourse: null,
    coursesInProgress: 0,
    completedCourses: 0,
    learningStreak: 0, // BETA
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            progress,
            courses (id, title, thumbnail_url)
          `)
          .eq('user_id', user.id);

        if (enrollmentsError) throw enrollmentsError;

        let coursesInProgress = 0;
        let completedCourses = 0;
        let totalProgressSum = 0;
        let activeCourse = null;

        if (enrollments && enrollments.length > 0) {
          enrollments.forEach(enr => {
            if (enr.progress > 0 && enr.progress < 100) {
              coursesInProgress++;
              if (!activeCourse || (activeCourse && enr.progress > activeCourse.progress)) { // Simplistic: highest progress is active
                activeCourse = { ...enr.courses, progress: enr.progress };
              }
            } else if (enr.progress === 100) {
              completedCourses++;
            }
            totalProgressSum += enr.progress;
          });
          
          // If no course is >0 and <100, pick the first enrolled course with 0 progress as active
          if (!activeCourse && enrollments.length > 0) {
             const firstZeroProgress = enrollments.find(e => e.progress === 0);
             if (firstZeroProgress) {
                activeCourse = { ...firstZeroProgress.courses, progress: firstZeroProgress.progress };
             } else if (enrollments.length > 0 && !activeCourse) { // if all are completed or other states
                activeCourse = { ...enrollments[0].courses, progress: enrollments[0].progress };
             }
          }
        }
        
        const overallProgress = enrollments && enrollments.length > 0 ? Math.round(totalProgressSum / enrollments.length) : 0;
        
        setDashboardData({
          name: user?.name || 'Student',
          activeCourse: activeCourse,
          coursesInProgress: coursesInProgress,
          completedCourses: completedCourses,
          learningStreak: 0, // Placeholder for BETA feature
          overallProgress: overallProgress,
        });

      } catch (err) {
        setError(err.message);
        toast({ variant: 'destructive', title: 'Error loading dashboard', description: err.message });
        console.error("Student dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

  if (loading) return <p>Loading your dashboard...</p>;
  
  if (error) return (
    <Card className="bg-destructive/10 border-destructive">
        <CardHeader><CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2"/> Error Loading Dashboard</CardTitle></CardHeader>
        <CardContent><p className="text-destructive-foreground">{error}</p></CardContent>
    </Card>
  );


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Welcome back, {dashboardData.name}!</h1>
      
      <Card className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Continue Learning</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            {dashboardData.activeCourse ? `Pick up where you left off in "${dashboardData.activeCourse.title}"!` : 'Explore new topics and kickstart your journey.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            {dashboardData.activeCourse ? (
              <>
                <h3 className="text-xl font-semibold">{dashboardData.activeCourse.title}</h3>
                <Progress value={dashboardData.activeCourse.progress} className="mt-2 mb-1 h-2 bg-primary-foreground/30 [&>div]:bg-primary-foreground" />
                <p className="text-sm text-primary-foreground/80">{dashboardData.activeCourse.progress}% complete</p>
              </>
            ) : (
              <h3 className="text-xl font-semibold">No active course</h3>
            )}
             <p className="text-sm text-primary-foreground/80">
              {dashboardData.activeCourse ? 'Ready to dive back in?' : 'Explore our catalog to find your next learning adventure.'}
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="lg" 
            asChild 
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link to={dashboardData.activeCourse ? `/student/courses/${dashboardData.activeCourse.id}` : "/student/courses"}>
              <PlayCircle className="mr-2 h-5 w-5" /> 
              {dashboardData.activeCourse ? (dashboardData.activeCourse.progress > 0 ? 'Continue Course' : 'Start Course') : 'Browse Courses'}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses in Progress</CardTitle>
            <BookOpenText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.coursesInProgress}</div>
            <p className="text-xs text-muted-foreground">Keep up the great work!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <Award className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.completedCourses}</div>
            <p className="text-xs text-muted-foreground">Celebrate your achievements!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak (BETA)</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.learningStreak} Days</div>
            <p className="text-xs text-muted-foreground">Stay consistent to build your streak!</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Overall Learning Path</CardTitle>
          <CardDescription>Your progress across all enrolled courses.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          {dashboardData.coursesInProgress === 0 && dashboardData.completedCourses === 0 ? (
             <p className="text-muted-foreground mb-2">No courses enrolled yet.</p>
          ) : (
            <p className="text-muted-foreground mb-2">You've completed {dashboardData.overallProgress}% of your current learning goals.</p>
          )}
          <Progress value={dashboardData.overallProgress} className="w-full h-3 mb-4" />
          <Button asChild><Link to="/student/courses">Explore More Courses</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboardPage;

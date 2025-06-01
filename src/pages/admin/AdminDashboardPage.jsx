import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, BookOpen, BarChart2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    avgProgress: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { count: studentCount, error: studentError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('role', 'student');
        if (studentError) throw studentError;

        const { count: courseCount, error: courseError } = await supabase
          .from('courses')
          .select('id', { count: 'exact' });
        if (courseError) throw courseError;

        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('progress');
        if (enrollmentsError) throw enrollmentsError;

        const totalEnrollments = enrollmentsData?.length || 0;
        const totalProgressSum = enrollmentsData?.reduce((sum, enr) => sum + (enr.progress || 0), 0) || 0;
        const avgProgress = totalEnrollments > 0 ? Math.round(totalProgressSum / totalEnrollments) : 0;
        
        setStats({
          totalStudents: studentCount || 0,
          totalCourses: courseCount || 0,
          avgProgress: avgProgress,
          totalEnrollments: totalEnrollments,
        });

      } catch (err) {
        setError(err.message);
        toast({ variant: 'destructive', title: 'Error fetching dashboard data', description: err.message });
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const displayStats = [
    { title: 'Total Students', value: stats.totalStudents, icon: <Users className="h-6 w-6 text-primary" /> },
    { title: 'Total Courses', value: stats.totalCourses, icon: <BookOpen className="h-6 w-6 text-primary" /> },
    { title: 'Avg. Progress', value: `${stats.avgProgress}%`, icon: <BarChart2 className="h-6 w-6 text-primary" /> },
    { title: 'Total Enrollments', value: stats.totalEnrollments, icon: <CheckCircle className="h-6 w-6 text-primary" /> },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      {loading && <p>Loading dashboard data...</p>}
      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2"/> Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
            <p className="text-sm text-destructive-foreground/80 mt-2">Some dashboard statistics might be unavailable. Please try refreshing or check the console.</p>
          </CardContent>
        </Card>
      )}

      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {/* <p className="text-xs text-muted-foreground">{stat.change}</p> */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of recent platform events.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Recent activity feed (e.g., new enrollments, course completions) will be implemented here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>Quick access to course operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center py-12">
             <p className="text-muted-foreground">Manage your courses, add new content, and view enrollments.</p>
             <div className="flex justify-center gap-4">
                <Button asChild><Link to="/admin/courses">Manage Courses</Link></Button>
                <Button variant="outline" asChild><Link to="/admin/courses/new">Add New Course</Link></Button>
             </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild><Link to="/admin/courses/new">Add New Course</Link></Button>
          <Button variant="outline" asChild><Link to="/admin/students">Manage Students</Link></Button>
          <Button variant="outline" asChild><Link to="/admin/analytics">View Analytics (BETA)</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;

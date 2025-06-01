import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, BookOpen, Play, Filter, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const StudentCoursesPage = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCoursesMap, setEnrolledCoursesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'enrolled', 'not-enrolled', 'in-progress', 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCoursesAndEnrollments = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, description, category, instructor_name, thumbnail_url, created_at')
        .order('created_at', { ascending: false });
      if (coursesError) throw coursesError;
      setAllCourses(coursesData || []);

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id, progress, id')
        .eq('user_id', user.id);
      if (enrollmentsError) throw enrollmentsError;
      
      const enrolledMap = (enrollmentsData || []).reduce((acc, enr) => {
        acc[enr.course_id] = { progress: enr.progress, enrollmentId: enr.id };
        return acc;
      }, {});
      setEnrolledCoursesMap(enrolledMap);

    } catch (err) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error fetching data', description: err.message });
      console.error("Error fetching courses/enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCoursesAndEnrollments();
    }
  }, [user]);

  const handleEnroll = async (courseId, courseTitle) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to enroll.' });
      navigate('/login');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({ user_id: user.id, course_id: courseId, progress: 0 })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
             toast({ variant: 'destructive', title: 'Already Enrolled', description: `You are already enrolled in "${courseTitle}".` });
        } else {
            throw error;
        }
      } else if (data) {
        setEnrolledCoursesMap(prev => ({ ...prev, [courseId]: { progress: 0, enrollmentId: data.id } }));
        toast({ title: 'Enrollment Successful!', description: `You've enrolled in "${courseTitle}". Happy learning!`, 
        action: <Button variant="outline" size="sm" onClick={() => navigate(`/student/courses/${courseId}`)}>Go to Course</Button>
        });
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Enrollment Failed', description: err.message });
      console.error("Error enrolling in course:", err);
    }
  };


  const filteredCourses = allCourses
    .map(course => ({
      ...course,
      isEnrolled: !!enrolledCoursesMap[course.id],
      progress: enrolledCoursesMap[course.id]?.progress || 0,
      enrollmentId: enrolledCoursesMap[course.id]?.enrollmentId,
    }))
    .filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(course => {
      if (filter === 'all') return true;
      if (filter === 'enrolled') return course.isEnrolled;
      if (filter === 'not-enrolled') return !course.isEnrolled;
      if (filter === 'in-progress') return course.isEnrolled && course.progress > 0 && course.progress < 100;
      if (filter === 'completed') return course.isEnrolled && course.progress === 100;
      return true;
    });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">Browse available courses and manage your learning journey.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Course Catalog</CardTitle>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search courses..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="enrolled">My Enrolled</SelectItem>
                  <SelectItem value="not-enrolled">Not Enrolled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading courses...</p>}
          {error && (
            <div className="text-red-500 p-4 border border-red-500 rounded-md bg-red-50">
              <AlertTriangle className="inline mr-2" /> Error: {error}
            </div>
          )}

          {!loading && !error && filteredCourses.length === 0 && (
             <div className="border rounded-lg p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground">
                {allCourses.length === 0 ? "No courses available at the moment. Check back soon!" : "Try adjusting your search or filter."}
              </p>
            </div>
          )}

          {!loading && !error && filteredCourses.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
              {filteredCourses.map((course, index) => (
                <motion.div
                    key={course.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                <Card className="flex flex-col overflow-hidden h-full hover:shadow-xl transition-shadow duration-300">
                  {course.thumbnail_url ? (
                     <div className="aspect-video bg-muted overflow-hidden">
                       <img-replace src={course.thumbnail_url} alt={course.title} className="object-cover w-full h-full" />
                     </div>
                    ) : (
                      <div className="aspect-video bg-secondary flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground" />
                      </div>
                  )}
                  <CardHeader className="flex-grow pb-2">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.category || 'General'} by {course.instructor_name || 'LearnPremium Team'}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pt-2">
                    {course.isEnrolled ? (
                      <>
                        <Progress value={course.progress} className="mb-2 h-2" />
                        <p className="text-sm text-muted-foreground">{course.progress}% complete</p>
                      </>
                    ) : (
                      <p className="text-sm text-primary font-medium">Available to enroll</p>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    {course.isEnrolled ? (
                      <Button className="w-full" asChild>
                        <Link to={`/student/courses/${course.id}`}>
                          <Play className="mr-2 h-4 w-4" /> {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                        </Link>
                      </Button>
                    ) : (
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="default" className="w-full">
                                Enroll Now
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Enroll in "{course.title}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                You are about to enroll in this course. Are you ready to start learning?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleEnroll(course.id, course.title)}>
                                <CheckCircle className="mr-2 h-4 w-4"/>Confirm Enrollment
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    )}
                  </CardFooter>
                </Card>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentCoursesPage;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Edit, Trash2, BookOpen, AlertTriangle, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
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
import { motion, AnimatePresence } from 'framer-motion';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, category, instructor_name, created_at, thumbnail_url')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error fetching courses', description: err.message });
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId, courseTitle) => {
    try {
      // First, delete related lessons as they have a CASCADE relationship
      // This step might be implicitly handled by ON DELETE CASCADE on the lessons table for course_id
      // but explicit deletion or checking storage items might be needed if files are not automatically removed.
      
      // Delete course thumbnail from storage
      const courseToDelete = courses.find(c => c.id === courseId);
      if (courseToDelete?.thumbnail_url) {
        const fileName = courseToDelete.thumbnail_url.split('/').pop();
        if (fileName) {
            const { error: storageError } = await supabase.storage.from('course_thumbnails').remove([fileName]);
            if (storageError) console.warn("Could not delete thumbnail from storage:", storageError.message);
        }
      }

      // Then delete the course itself
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;

      setCourses(courses.filter(course => course.id !== courseId));
      toast({ title: 'Course Deleted', description: `Course "${courseTitle}" has been successfully deleted.` });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error deleting course', description: err.message });
      console.error("Error deleting course:", err);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
          <p className="text-muted-foreground">Add, edit, or delete courses and their content.</p>
        </div>
        <Button asChild>
          <Link to="/admin/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Course
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
          <CardDescription>Search and manage existing courses.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search courses by title, description, category..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading && <p>Loading courses...</p>}
          {error && (
            <div className="text-red-500 p-4 border border-red-500 rounded-md bg-red-50">
              <AlertTriangle className="inline mr-2" /> Error: {error}
            </div>
          )}

          {!loading && !error && filteredCourses.length === 0 && (
            <div className="border rounded-lg p-8 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground mb-4">
                {courses.length === 0 ? "Start by adding your first course." : "Try a different search term or add more courses."}
              </p>
              {courses.length === 0 && (
                <Button asChild>
                  <Link to="/admin/courses/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add First Course
                  </Link>
                </Button>
              )}
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
                      <CardHeader className="flex-grow">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>{course.category || 'No category'}</CardDescription>
                        <CardDescription className="text-xs pt-1">By: {course.instructor_name || 'N/A'}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {course.description || 'No description available.'}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center gap-2 border-t pt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/courses/edit/${course.id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the course "{course.title}" and all its associated lessons and student progress.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCourse(course.id, course.title)}>
                                Delete Course
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

export default AdminCoursesPage;

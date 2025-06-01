import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, UploadCloud, XCircle, Video, FileText, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';

const AdminCourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = Boolean(courseId);

  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true);
      const fetchCourseData = async () => {
        try {
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

          if (courseError) throw courseError;
          if (!courseData) throw new Error('Course not found');

          setTitle(courseData.title);
          setDescription(courseData.description || '');
          setCategory(courseData.category || '');
          setExistingThumbnailUrl(courseData.thumbnail_url);
          setThumbnailPreview(courseData.thumbnail_url);

          const { data: lessonsData, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('lesson_order', { ascending: true });

          if (lessonsError) throw lessonsError;
          setLessons(lessonsData.map(l => ({ ...l, tempId: l.id, videoFile: null, pdfFile: null, existingVideoUrl: l.video_url, existingPdfUrl: l.pdf_url })) || []);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error fetching course data', description: error.message });
          navigate('/admin/courses');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCourseData();
    }
  }, [courseId, isEditMode, navigate, toast]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLesson = () => {
    setLessons([...lessons, { tempId: uuidv4(), title: '', description: '', videoFile: null, pdfFile: null, lesson_order: lessons.length +1, existingVideoUrl: null, existingPdfUrl: null }]);
  };

  const updateLessonField = (index, field, value) => {
    const newLessons = [...lessons];
    newLessons[index][field] = value;
    setLessons(newLessons);
  };

  const handleLessonFileChange = (index, fileType, e) => {
    const file = e.target.files[0];
    if (file) {
      updateLessonField(index, fileType === 'video' ? 'videoFile' : 'pdfFile', file);
    }
  };

  const removeLesson = (index) => {
    const lessonToRemove = lessons[index];
    // Note: Actual deletion from storage/DB for existing lessons handled during submit
    setLessons(lessons.filter((_, i) => i !== index).map((l, idx) => ({ ...l, lesson_order: idx + 1})));
  };
  
  const moveLesson = (index, direction) => {
    const newLessons = [...lessons];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLessons.length) return;

    [newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]];
    setLessons(newLessons.map((l, idx) => ({ ...l, lesson_order: idx + 1 })));
  };

  const uploadFile = async (file, bucket, pathPrefix = '') => {
    if (!file) return null;
    const fileName = `${pathPrefix}${uuidv4()}-${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrlData.publicUrl; // For public buckets like thumbnails
    // For private buckets, you might just store data.path and generate signed URLs on demand
    // For this implementation, we assume video/pdf paths are stored and policies handle access
    // return data.path; 
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Course title is required.' });
      return;
    }
    setIsSubmitting(true);

    try {
      let currentThumbnailUrl = existingThumbnailUrl;
      if (thumbnailFile) {
        if (existingThumbnailUrl) { // Delete old thumbnail if a new one is uploaded
          const oldFileName = existingThumbnailUrl.split('/').pop();
          if (oldFileName) await supabase.storage.from('course_thumbnails').remove([oldFileName]);
        }
        currentThumbnailUrl = await uploadFile(thumbnailFile, 'course_thumbnails');
      }

      const coursePayload = {
        title,
        description,
        category,
        thumbnail_url: currentThumbnailUrl,
        instructor_id: user?.id,
        instructor_name: user?.name || user?.email,
        slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + '-' + uuidv4().substring(0,6), // simple slug
      };

      let savedCourseId = courseId;
      if (isEditMode) {
        const { error: updateError } = await supabase.from('courses').update(coursePayload).eq('id', courseId);
        if (updateError) throw updateError;
      } else {
        const { data: newCourse, error: insertError } = await supabase.from('courses').insert(coursePayload).select('id').single();
        if (insertError) throw insertError;
        savedCourseId = newCourse.id;
      }

      // Process lessons
      const lessonPromises = lessons.map(async (lesson, index) => {
        let videoUrlToSave = lesson.existingVideoUrl;
        if (lesson.videoFile) {
          if (lesson.existingVideoUrl) { // Delete old video
             await supabase.storage.from('course_videos').remove([lesson.existingVideoUrl]);
          }
          videoUrlToSave = (await uploadFile(lesson.videoFile, 'course_videos', `${savedCourseId}/`)).split('/').pop();
        }

        let pdfUrlToSave = lesson.existingPdfUrl;
        if (lesson.pdfFile) {
           if (lesson.existingPdfUrl) { // Delete old PDF
             await supabase.storage.from('course_pdfs').remove([lesson.existingPdfUrl]);
           }
          pdfUrlToSave = (await uploadFile(lesson.pdfFile, 'course_pdfs', `${savedCourseId}/`)).split('/').pop();
        }

        const lessonPayload = {
          course_id: savedCourseId,
          title: lesson.title,
          description: lesson.description,
          video_url: videoUrlToSave,
          pdf_url: pdfUrlToSave,
          lesson_order: index + 1, // Re-ensure order based on current array position
        };
        
        if (lesson.id && !lesson.tempId.startsWith('temp-')) { // Existing lesson (check if it's not a newly added one)
            return supabase.from('lessons').update(lessonPayload).eq('id', lesson.id);
        } else { // New lesson
            return supabase.from('lessons').insert(lessonPayload);
        }
      });
      
      const results = await Promise.all(lessonPromises);
      results.forEach(result => {
        if (result.error) throw new Error(`Failed to save a lesson: ${result.error.message}`);
      });

      // Handle deleted lessons for existing courses
      if(isEditMode) {
        const { data: existingLessonsInDb } = await supabase.from('lessons').select('id, video_url, pdf_url').eq('course_id', savedCourseId);
        const lessonsToRemoveFromDb = existingLessonsInDb.filter(dbLesson => !lessons.find(l => l.id === dbLesson.id));
        
        for (const lessonToRemove of lessonsToRemoveFromDb) {
            if (lessonToRemove.video_url) await supabase.storage.from('course_videos').remove([lessonToRemove.video_url]);
            if (lessonToRemove.pdf_url) await supabase.storage.from('course_pdfs').remove([lessonToRemove.pdf_url]);
            await supabase.from('lessons').delete().eq('id', lessonToRemove.id);
        }
      }


      toast({ title: `Course ${isEditMode ? 'Updated' : 'Created'}`, description: `"${title}" has been successfully saved.` });
      navigate('/admin/courses');
    } catch (error) {
      console.error("Submission error:", error);
      toast({ variant: 'destructive', title: `Error ${isEditMode ? 'Updating' : 'Creating'} Course`, description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Loading course data...</p>;
  
  const lessonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Course' : 'Add New Course'}</CardTitle>
          <CardDescription>Fill in the details for the course.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Introduction to React" required />
          </div>
          <div>
            <Label htmlFor="description">Course Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief overview of the course content." />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Web Development, Design" />
          </div>
          <div>
            <Label htmlFor="thumbnail">Course Thumbnail</Label>
            <Input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            {thumbnailPreview && (
              <div className="mt-4 relative w-48 h-32">
                <img-replace src={thumbnailPreview} alt="Thumbnail preview" className="rounded-md object-cover w-full h-full" />
                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => {setThumbnailFile(null); setThumbnailPreview(isEditMode ? existingThumbnailUrl : null);}}>
                  <XCircle size={16}/>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
          <CardDescription>Add and manage course lessons.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence>
          {lessons.map((lesson, index) => (
            <motion.div 
                key={lesson.tempId}
                variants={lessonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
            >
            <Card className="p-4 bg-secondary/30 relative" >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center pt-1">
                     <GripVertical size={20} className="text-muted-foreground cursor-grab" />
                     <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                <div className="space-y-3 flex-grow">
                    <Input placeholder="Lesson Title" value={lesson.title} onChange={(e) => updateLessonField(index, 'title', e.target.value)} required/>
                    <Textarea placeholder="Lesson Description (optional)" value={lesson.description} onChange={(e) => updateLessonField(index, 'description', e.target.value)} rows={2}/>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`lesson-video-${index}`} className="flex items-center gap-2 mb-1"><Video size={16}/> Video File</Label>
                            <Input id={`lesson-video-${index}`} type="file" accept="video/*" onChange={(e) => handleLessonFileChange(index, 'video', e)} className="file:text-sm" />
                            {lesson.videoFile && <p className="text-xs text-muted-foreground mt-1">New: {lesson.videoFile.name}</p>}
                            {!lesson.videoFile && lesson.existingVideoUrl && <p className="text-xs text-muted-foreground mt-1">Current: {lesson.existingVideoUrl.split('/').pop()}</p>}
                        </div>
                        <div>
                            <Label htmlFor={`lesson-pdf-${index}`} className="flex items-center gap-2 mb-1"><FileText size={16}/> PDF File (optional)</Label>
                            <Input id={`lesson-pdf-${index}`} type="file" accept=".pdf" onChange={(e) => handleLessonFileChange(index, 'pdf', e)} className="file:text-sm"/>
                            {lesson.pdfFile && <p className="text-xs text-muted-foreground mt-1">New: {lesson.pdfFile.name}</p>}
                            {!lesson.pdfFile && lesson.existingPdfUrl && <p className="text-xs text-muted-foreground mt-1">Current: {lesson.existingPdfUrl.split('/').pop()}</p>}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveLesson(index, 'up')} disabled={index === 0} className="h-7 w-7"><ArrowUp size={16}/></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveLesson(index, 'down')} disabled={index === lessons.length - 1} className="h-7 w-7"><ArrowDown size={16}/></Button>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeLesson(index)} className="h-7 w-7 mt-2"><Trash2 size={16}/></Button>
                </div>
              </div>
            </Card>
            </motion.div>
          ))}
          </AnimatePresence>
          <Button type="button" variant="outline" onClick={addLesson} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Lesson
          </Button>
        </CardContent>
      </Card>

      <CardFooter className="flex justify-end gap-2 pt-6">
        <Button type="button" variant="outline" onClick={() => navigate('/admin/courses')} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? (isEditMode ? 'Updating Course...' : 'Creating Course...') : (isEditMode ? 'Save Changes' : 'Create Course')}
          {isSubmitting && <UploadCloud className="ml-2 h-4 w-4 animate-pulse" />}
        </Button>
      </CardFooter>
    </form>
  );
};

export default AdminCourseForm;

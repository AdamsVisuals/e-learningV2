
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users2 } from 'lucide-react';

const AdminStudentsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
      <p className="text-muted-foreground">View student enrollments, progress, and actions.</p>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>Search and manage student accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search students by name or email..." className="pl-10" />
            </div>
            <Button variant="outline">Search</Button>
          </div>
          
          <div className="border rounded-lg p-8 text-center">
            <Users2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Students Found</h3>
            <p className="text-muted-foreground">
              Student data will appear here once students register and enroll in courses.
            </p>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground text-center">
        Student management features will be fully implemented with Supabase integration.
      </p>
    </div>
  );
};

export default AdminStudentsPage;
  
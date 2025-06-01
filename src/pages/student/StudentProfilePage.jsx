
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Edit3, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const StudentProfilePage = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    const names = nameStr.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Placeholder for Supabase update
    console.log('Updating profile:', { name, email });
    toast({ title: 'Profile Updated', description: 'Your profile details have been saved (simulated).' });
    setIsEditing(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters long.' });
      return;
    }
    // Placeholder for Supabase password change
    console.log('Changing password');
    toast({ title: 'Password Changed', description: 'Your password has been updated (simulated).' });
    setNewPassword('');
    setConfirmNewPassword('');
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>Not logged in.</p>;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      
      <Card>
        <CardHeader className="items-center text-center">
          <div className="relative w-32 h-32 mb-4">
            <Avatar className="w-32 h-32 text-4xl">
              <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full bg-background hover:bg-accent">
              <Camera className="h-5 w-5" />
              <span className="sr-only">Change profile picture</span>
            </Button>
          </div>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <CardDescription>{user.email} - Student</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} />
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button type="submit" className="flex-1"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)} className="w-full">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password for enhanced security.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">Update Password</Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground text-center">
        Profile and password updates are currently simulated. Full functionality will be available with Supabase.
      </p>
    </div>
  );
};

export default StudentProfilePage;
  
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error.message);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', session.user.id)
          .maybeSingle(); 

        if (profileError && profileError.code !== 'PGRST116') { 
          console.error('Error fetching profile:', profileError.message);
          setUser({ 
            id: session.user.id, 
            email: session.user.email, 
            role: session.user.app_metadata?.userrole || 'student',
            name: session.user.user_metadata?.full_name || session.user.email 
          });
        } else if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: profile?.role || session.user.app_metadata?.userrole || 'student',
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email,
            avatarUrl: profile?.avatar_url,
          });
        } else { 
          setUser({ 
            id: session.user.id, 
            email: session.user.email, 
            role: session.user.app_metadata?.userrole || 'student',
            name: session.user.user_metadata?.full_name || session.user.email 
          });
        }
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
         const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile on auth state change:', profileError.message);
          setUser({ 
            id: session.user.id, 
            email: session.user.email, 
            role: session.user.app_metadata?.userrole || 'student',
            name: session.user.user_metadata?.full_name || session.user.email 
          });
        } else if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: profile?.role || session.user.app_metadata?.userrole || 'student',
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email,
            avatarUrl: profile?.avatar_url,
          });
        } else {
          setUser({ 
            id: session.user.id, 
            email: session.user.email, 
            role: session.user.app_metadata?.userrole || 'student',
            name: session.user.user_metadata?.full_name || session.user.email 
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);
  
  const ensureAdminExists = async () => {
    const adminEmail = 'admin@example.com';
  
    const { data: adminProfileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email_non_unique', adminEmail)
      .limit(1);

    if (profileError && profileError.code !== '42P01') { 
      console.error("Error checking admin profile:", profileError.message);
      return;
    }
    
    if (profileError && profileError.code === '42P01') {
      console.warn("Profiles table does not exist. Admin role might not be set.");
      return;
    }

    if (!adminProfileData || adminProfileData.length === 0) {
       console.warn(`Admin profile for ${adminEmail} not found in 'profiles' table. Create it manually in Supabase Studio with role 'admin', or ensure the SQL migration ran correctly to create it if the auth user exists.`);
    }
  };

  useEffect(() => {
    ensureAdminExists();
  }, []);


  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
      setLoading(false);
      throw error;
    }
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name, avatar_url')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile on login:', profileError.message);
        toast({ variant: 'destructive', title: 'Login Partially Successful', description: 'Could not fetch full profile details.' });
        setUser({ 
            id: data.user.id, 
            email: data.user.email, 
            role: data.user.app_metadata?.userrole || 'student',
            name: data.user.user_metadata?.full_name || data.user.email 
        });
      } else if (profile) {
         setUser({
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || data.user.app_metadata?.userrole || 'student',
          name: profile?.full_name || data.user.user_metadata?.full_name || data.user.email,
          avatarUrl: profile?.avatar_url,
        });
      } else {
        setUser({ 
            id: data.user.id, 
            email: data.user.email, 
            role: data.user.app_metadata?.userrole || 'student',
            name: data.user.user_metadata?.full_name || data.user.email 
        });
        console.warn(`Profile not found for user ${data.user.id} after login. User details set from auth session.`);
      }
      toast({ title: 'Login Successful', description: `Welcome back, ${profile?.full_name || data.user.email}!` });
    }
    setLoading(false);
    return data.user;
  };

  const register = async (name, email, password) => {
    setLoading(true);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          userrole: 'student', 
        },
      },
    });

    if (signUpError) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: signUpError.message });
      setLoading(false);
      throw signUpError;
    }
    
    if (signUpData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { id: signUpData.user.id, full_name: name, role: 'student', email_non_unique: email },
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError.message);
        toast({ variant: 'destructive', title: 'Registration Partially Successful', description: 'Could not create user profile. Please contact support.' });
        setUser({ 
            id: signUpData.user.id, 
            email: signUpData.user.email, 
            role: 'student', 
            name 
        });
      } else {
         setUser({ 
            id: signUpData.user.id, 
            email: signUpData.user.email, 
            role: 'student', 
            name 
        });
        toast({ title: 'Registration Successful', description: `Welcome, ${name}! Please check your email to verify your account.` });
      }
    }
    setLoading(false);
    return signUpData.user;
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ variant: 'destructive', title: 'Logout Failed', description: error.message });
    } else {
      setUser(null);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    }
    setLoading(false);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
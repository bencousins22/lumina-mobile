
import { useState, useEffect } from 'react';
import { onAuthChange, UserProfile, signUp as fbSignUp, signIn as fbSignIn, logOut as fbLogOut } from '../lib/auth';

export type { UserProfile };

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const userProfile = await fbSignUp(email, password);
      setUser(userProfile);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userProfile = await fbSignIn(email, password);
      setUser(userProfile);
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await fbLogOut();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return { user, loading, signUp, signIn, logOut };
}

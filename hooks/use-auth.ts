
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
      if (error instanceof Error) {
        throw new Error(`Sign-up failed: ${error.message}`);
      }
      throw new Error("An unknown error occurred during sign-up.");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userProfile = await fbSignIn(email, password);
      setUser(userProfile);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Sign-in failed: ${error.message}`);
      }
      throw new Error("An unknown error occurred during sign-in.");
    }
  };

  const logOut = async () => {
    try {
      await fbLogOut();
      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Log-out failed: ${error.message}`);
      }
      throw new Error("An unknown error occurred during log-out.");
    }
  };

  return { user, loading, signUp, signIn, logOut };
}

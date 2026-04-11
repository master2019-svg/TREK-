import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { LogIn, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginButton({ className }: { className?: string }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL
          })
        });
      }
    } catch (error: any) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleLogin}
      disabled={isLoggingIn}
      className={`py-4 px-8 bg-gradient-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg shadow-trek-green/20 disabled:opacity-70 disabled:cursor-not-allowed ${className || ''}`}
    >
      {isLoggingIn ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <LogIn className="w-5 h-5" />
      )}
      {isLoggingIn ? 'Connecting...' : 'Sign In with Google'}
    </motion.button>
  );
}

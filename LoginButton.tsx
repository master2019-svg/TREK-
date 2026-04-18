import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, db, getAuthErrorMessage } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginButton({ className }: { className?: string }) {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (isLoggingIn) return;
        setIsLoggingIn(true);
        setError(null);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user) {
                const userRef = doc(db, "users", result.user.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        uid: result.user.uid,
                        email: result.user.email,
                        displayName: result.user.displayName,
                        photoURL: result.user.photoURL,
                        following: [],
                        followers: [],
                        createdAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString()
                    });
                } else {
                    await updateDoc(userRef, {
                        email: result.user.email,
                        displayName: result.user.displayName,
                        photoURL: result.user.photoURL,
                        lastLogin: new Date().toISOString()
                    });
                }
            }
        } catch (err: any) {
            const errorMessage = getAuthErrorMessage(err);
            setError(errorMessage);
            console.error('Login failed:', err);
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                </motion.div>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogin} disabled={isLoggingIn} className={`py-4 px-8 bg-gradient-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg shadow-trek-green/20 disabled:opacity-70 disabled:cursor-not-allowed ${className || ''}`}> 
                {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <LogIn className="w-5 h-5" />
                )} 
                {isLoggingIn ? 'Connecting...' : 'Sign In with Google'}
            </motion.button>
        </div>
    );
}
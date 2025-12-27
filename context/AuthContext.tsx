import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string) => Promise<void>; // Auto-registers if not found
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  getAllUsers: () => UserProfile[];
  deleteUser: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'ailton21santos07@gmail.com';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Lazy initialization ensures we check localStorage before the first render
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const sessionUser = localStorage.getItem('fitboost_session_user');
      return sessionUser ? JSON.parse(sessionUser) : null;
    } catch (e) {
      console.error("Failed to parse session user", e);
      localStorage.removeItem('fitboost_session_user'); // Clear corrupted data
      return null;
    }
  });

  const login = async (email: string): Promise<void> => {
    // Simulate network delay for "Google Auth" feel
    await new Promise(resolve => setTimeout(resolve, 800));

    const storageKey = `fitboost_data_${email}`;
    let storedData = localStorage.getItem(storageKey);
    let activeUser: UserProfile;

    if (storedData) {
        // USER EXISTS: Load data
        console.log("Existing user found:", email);
        activeUser = JSON.parse(storedData);
    } else {
        // USER DOES NOT EXIST: Auto-register
        console.log("New user, auto-registering:", email);
        const derivedName = email.split('@')[0]; // Use email prefix as default name
        
        activeUser = {
            id: Date.now().toString(),
            email,
            name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1), // Capitalize
            onboarded: false,
            isAdmin: email === ADMIN_EMAIL
        };
        
        // Save permanently
        localStorage.setItem(storageKey, JSON.stringify(activeUser));
    }

    // Force admin flag logic (security check)
    if (email === ADMIN_EMAIL) {
        activeUser.isAdmin = true;
    }

    // Set Session
    setUser(activeUser);
    localStorage.setItem('fitboost_session_user', JSON.stringify(activeUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fitboost_session_user');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    
    // 1. Update React State
    setUser(updatedUser);
    
    // 2. Update Current Session
    localStorage.setItem('fitboost_session_user', JSON.stringify(updatedUser));
    
    // 3. Update Persistent Storage
    localStorage.setItem(`fitboost_data_${user.email}`, JSON.stringify(updatedUser));
  };

  // ADMIN FUNCTIONS
  const getAllUsers = (): UserProfile[] => {
    const users: UserProfile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fitboost_data_')) {
            try {
                const userData = JSON.parse(localStorage.getItem(key)!);
                users.push(userData);
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }
    return users;
  };

  const deleteUser = (targetEmail: string) => {
    if (targetEmail === ADMIN_EMAIL) {
        console.warn("Attempted to delete admin.");
        return;
    }
    
    // Remove user profile data
    localStorage.removeItem(`fitboost_data_${targetEmail}`);
    
    // Remove specific chat histories
    localStorage.removeItem(`fitboost_history_${targetEmail}_trainer`);
    localStorage.removeItem(`fitboost_history_${targetEmail}_nutritionist`);

    // If the deleted user is somehow the current session (rare edge case in single browser usage), logout
    const sessionUser = localStorage.getItem('fitboost_session_user');
    if (sessionUser) {
        const parsedSession = JSON.parse(sessionUser);
        if (parsedSession.email === targetEmail) {
            localStorage.removeItem('fitboost_session_user');
            setUser(null);
        }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isAuthenticated: !!user, getAllUsers, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
import { useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  createdAt: string;
  updatedAt: string;
}

const defaultProfile: Partial<UserProfile> = {
  name: '',
  email: '',
  phone: '',
  bio: '',
  location: '',
  avatar: '',
  dateOfBirth: '',
  gender: '',
  occupation: ''
};

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const now = new Date().toISOString();
      const updatedProfile = {
        ...defaultProfile,
        ...profile,
        ...profileData,
        id: profile?.id || `user_${Date.now()}`,
        updatedAt: now,
        createdAt: profile?.createdAt || now,
      } as UserProfile;

      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  };

  const clearProfile = () => {
    localStorage.removeItem('userProfile');
    setProfile(null);
  };

  return {
    profile,
    loading,
    saveProfile,
    clearProfile,
    hasProfile: !!profile?.id
  };
}
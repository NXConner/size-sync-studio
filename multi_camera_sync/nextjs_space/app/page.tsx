'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Plus, LogIn, Camera, Users, Play, Grid } from 'lucide-react';
import { parseSessionFromURL, storeSessionId, retrieveSessionId } from '@/lib/sync-utils';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for session in URL or localStorage
  useEffect(() => {
    const sessionFromUrl = parseSessionFromURL();
    if (sessionFromUrl) {
      storeSessionId(sessionFromUrl);
      router?.push?.(`/session/${sessionFromUrl}`);
      return;
    }

    const savedSession = retrieveSessionId();
    if (savedSession) {
      // Ask user if they want to rejoin
      const rejoin = confirm('Would you like to rejoin your previous session?');
      if (rejoin) {
        router?.push?.(`/session/${savedSession}`);
      } else {
        storeSessionId(null);
      }
    }
  }, [router]);

  const handleCreateSession = async () => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch('/api/sessions', {
        method: 'POST',
      });

      const data = await response?.json?.();

      if (data?.success && data?.session) {
        const sessionId = data?.session?.id;
        storeSessionId(sessionId);
        router?.push?.(`/session/${sessionId}`);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = () => {
    if (!joinCode?.trim()) {
      setError('Please enter a session code');
      return;
    }

    setError(null);
    storeSessionId(joinCode?.trim());
    router?.push?.(`/session/${joinCode?.trim()}`);
  };

  const { ref: featuresRef, inView: featuresInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="bg-purple-600 p-4 rounded-2xl shadow-xl"
            >
              <Video className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Multi-Camera Sync Studio
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect up to 4 cameras over your local network for synchronized recording and multi-angle playback.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {/* Create Session Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow"
          >
            <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Create Session
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start a new recording session and invite others to join with a shareable link.
            </p>
            
            <button
              onClick={handleCreateSession}
              disabled={isCreating}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create New Session
                </>
              )}
            </button>
          </motion.div>

          {/* Join Session Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow"
          >
            <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Join Session
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Enter a session code to join an existing recording session.
            </p>
            
            <div className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e?.target?.value ?? '')}
                onKeyPress={(e) => e?.key === 'Enter' && handleJoinSession()}
                placeholder="Enter session code"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              
              <button
                onClick={handleJoinSession}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Join Session
              </button>
            </div>
          </motion.div>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {/* Features Section */}
        <motion.div
          ref={featuresRef}
          initial={{ opacity: 0, y: 40 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
            Key Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Camera className="w-6 h-6" />}
              title="Multi-Camera Support"
              description="Connect 1-4 cameras simultaneously over your local network"
              color="purple"
            />
            
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Synchronized Recording"
              description="Start and stop recording across all cameras with precise timing"
              color="blue"
            />
            
            <FeatureCard
              icon={<Play className="w-6 h-6" />}
              title="Multi-Angle Playback"
              description="Switch between camera angles and view side-by-side during playback"
              color="green"
            />
            
            <FeatureCard
              icon={<Grid className="w-6 h-6" />}
              title="Responsive Grid"
              description="Adaptive layout that works on phones, tablets, and desktops"
              color="orange"
            />
            
            <FeatureCard
              icon={<Video className="w-6 h-6" />}
              title="Local Storage"
              description="Recordings saved directly to your device for privacy and control"
              color="pink"
            />
            
            <FeatureCard
              icon={<LogIn className="w-6 h-6" />}
              title="Easy Sharing"
              description="Share session links via QR code or copy-paste"
              color="indigo"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    pink: 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400',
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses?.[color] ?? colorClasses?.purple}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </motion.div>
  );
}

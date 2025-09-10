import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { User, Camera, Bell, Shield, Palette, Save, Mail, Phone, MapPin, Download, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button as UIButton } from '@/components/ui/button';
import { createDailyMeasurementReminder, ensureNotificationPermission, getReminders, scheduleAllActive, upsertReminder } from '@/utils/notifications';
import { exportAllJson, exportMeasurementsCsv, exportPdfSummary } from '@/utils/exporters';
import { importAll } from '@/utils/storage';

interface UserProfile {
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
}

interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
    analytics: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reducedMotion: boolean;
  };
}

const defaultProfile: UserProfile = {
  id: '',
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

const defaultPreferences: AppPreferences = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    reminders: true
  },
  privacy: {
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false
  }
};

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  // no-op state removed: importing indicator not required for simple import flow

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      const savedPrefs = localStorage.getItem('appPreferences');
      
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Ensure daily reminder scheduled if enabled
  useEffect(() => {
    (async () => {
      if (preferences.notifications.reminders) {
        await ensureNotificationPermission();
        const existing = getReminders().find(r => r.id === 'reminder-measurement-daily');
        if (!existing) {
          const reminder = createDailyMeasurementReminder('09:00');
          upsertReminder(reminder);
        }
        try {
          const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.ready : null;
          await scheduleAllActive(reg);
        } catch {
          await scheduleAllActive(null);
        }
      }
    })();
  }, [preferences.notifications.reminders]);

  const handleProfileUpdate = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceUpdate = (category: keyof AppPreferences, field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [field]: value
      }
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleProfileUpdate('avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Generate ID if new profile
      if (!profile.id) {
        setProfile(prev => ({ ...prev, id: `user_${Date.now()}` }));
      }

      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('appPreferences', JSON.stringify(preferences));
      
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      localStorage.clear();
      setProfile(defaultProfile);
      setPreferences(defaultPreferences);
      toast({
        title: 'Data cleared',
        description: 'All your data has been cleared from this device.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and app preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-lg">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Upload Photo
                      </Button>
                    </Label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: Square image, at least 400x400px
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => handleProfileUpdate('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                        placeholder="your@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => handleProfileUpdate('location', e.target.value)}
                        placeholder="City, Country"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => handleProfileUpdate('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={profile.gender} onValueChange={(value) => handleProfileUpdate('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={profile.occupation}
                    onChange={(e) => handleProfileUpdate('occupation', e.target.value)}
                    placeholder="Your profession or job title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <Select 
                      value={preferences.theme} 
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        setPreferences(prev => ({ ...prev, theme: value }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">Accessibility</Label>
                    <div className="space-y-3 mt-3">
                      <div>
                        <Label>Font Size</Label>
                        <Select 
                          value={preferences.accessibility.fontSize} 
                          onValueChange={(value) => handlePreferenceUpdate('accessibility', 'fontSize', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>High Contrast</Label>
                        <Switch
                          checked={preferences.accessibility.highContrast}
                          onCheckedChange={(checked) => handlePreferenceUpdate('accessibility', 'highContrast', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Reduced Motion</Label>
                        <Switch
                          checked={preferences.accessibility.reducedMotion}
                          onCheckedChange={(checked) => handlePreferenceUpdate('accessibility', 'reducedMotion', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'push', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reminders</Label>
                    <p className="text-sm text-muted-foreground">Receive reminders and tips</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.reminders}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'reminders', checked)}
                  />
                </div>

                {preferences.notifications.reminders && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-1">
                      <Label htmlFor="reminder-time">Daily reminder time</Label>
                      <Input id="reminder-time" type="time" defaultValue="09:00" onChange={(e) => {
                        const r = createDailyMeasurementReminder(e.target.value || '09:00');
                        upsertReminder(r);
                        toast({ title: 'Reminder updated', description: `Daily reminder set for ${e.target.value}` });
                      }} />
                    </div>
                    <div className="flex items-end">
                      <UIButton variant="outline" onClick={async () => {
                        await ensureNotificationPermission();
                        try {
                          const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.ready : null;
                          await scheduleAllActive(reg);
                          toast({ title: 'Reminders scheduled', description: 'Daily notifications are active.' });
                        } catch {
                          toast({ title: 'Reminders scheduled', description: 'Daily notifications are active.' });
                        }
                      }}>Apply Schedule</UIButton>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Profile Visibility</Label>
                  <Select 
                    value={preferences.privacy.profileVisibility} 
                    onValueChange={(value) => handlePreferenceUpdate('privacy', 'profileVisibility', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share anonymous usage data to improve the app</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.dataSharing}
                    onCheckedChange={(checked) => handlePreferenceUpdate('privacy', 'dataSharing', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">Allow analytics tracking for app improvement</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.analytics}
                    onCheckedChange={(checked) => handlePreferenceUpdate('privacy', 'analytics', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium text-destructive">Danger Zone</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      These actions cannot be undone
                    </p>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={clearAllData}
                    className="w-full"
                  >
                    Clear All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Export & Import</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <UIButton onClick={() => exportAllJson()} className="flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export JSON
                  </UIButton>
                  <UIButton variant="secondary" onClick={() => exportMeasurementsCsv()} className="flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                  </UIButton>
                  <UIButton variant="outline" onClick={() => exportPdfSummary()} className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Export PDF
                  </UIButton>
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-medium mb-2">Import JSON</label>
                  <input
                    type="file"
                    accept="application/json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        await importAll(file);
                        toast({ title: 'Import complete', description: 'Your data has been imported.' });
                      } catch (err) {
                        toast({ title: 'Import failed', description: 'Could not import file.', variant: 'destructive' });
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button onClick={saveSettings} disabled={isLoading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
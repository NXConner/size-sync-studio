import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Heart, 
  Settings, 
  Target, 
  TrendingUp, 
  Star,
  Tag,
  List,
  Clock,
  Shield,
  Brain,
  Users,
  Activity,
  BarChart3
} from 'lucide-react';
import { usePersonalization } from '../hooks/usePersonalization';
import { MoodType, PhysicalConsiderations, PartnerProfile } from '../types';

interface PersonalizationDashboardProps {
  userId: string;
}

export const PersonalizationDashboard: React.FC<PersonalizationDashboardProps> = ({ userId }) => {
  const {
    preferences,
    settings,
    recommendationSettings,
    stats,
    insights,
    isLoading,
    updatePreferences,
    updatePhysicalConsiderations,
    addPartnerProfile,
    updatePartnerProfile,
    updateMood,
    addCustomTag,
    updateCustomTag,
    deleteCustomTag,
    addFavoriteList,
    updateFavoriteList,
    deleteFavoriteList,
    addPositionToFavoriteList,
    removePositionFromFavoriteList,
    updateSettings,
    updateRecommendationSettings,
    calculatePersonalizationScore,
    getPersonalizationInsights
  } = usePersonalization(userId);

  const [activeTab, setActiveTab] = useState<'overview' | 'preferences' | 'partner' | 'mood' | 'tags' | 'lists' | 'settings'>('overview');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  const personalizationScore = calculatePersonalizationScore();
  const personalizationInsights = getPersonalizationInsights();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading personalization...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Personalization Data</h3>
        <p className="text-muted-foreground">Start customizing your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <User className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{personalizationScore}%</div>
            <div className="text-sm text-muted-foreground">Personalization</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Tag className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{preferences.customTags.length}</div>
            <div className="text-sm text-muted-foreground">Custom Tags</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <List className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{preferences.favoriteLists.length}</div>
            <div className="text-sm text-muted-foreground">Favorite Lists</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{preferences.partnerProfile ? '1' : '0'}</div>
            <div className="text-sm text-muted-foreground">Partner Profile</div>
          </CardContent>
        </Card>
      </div>

      {/* Personalization Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Personalization Progress
          </CardTitle>
          <CardDescription>
            Complete your profile to get better recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={personalizationScore} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>0%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="partner" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Partner
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Mood
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="lists" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lists
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {preferences.favoriteCategories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                  {preferences.favoriteCategories.length === 0 && (
                    <p className="text-muted-foreground">No favorite categories set</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Mood</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {preferences.moodSettings.currentMood}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {preferences.moodSettings.emotionalState}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Physical Considerations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Flexibility:</span>
                    <Badge variant="outline">{preferences.physicalConsiderations.flexibility}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Strength:</span>
                    <Badge variant="outline">{preferences.physicalConsiderations.strength}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Fitness Level:</span>
                    <Badge variant="outline">{preferences.physicalConsiderations.fitnessLevel}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partner Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {preferences.partnerProfile ? (
                  <div className="space-y-2">
                    <div className="font-medium">{preferences.partnerProfile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Experience: {preferences.partnerProfile.experienceLevel}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Communication: {preferences.partnerProfile.communicationStyle}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No partner profile set</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Favorite Categories</Label>
                  <Select
                    value={preferences.favoriteCategories[0] || ''}
                    onValueChange={(value) => updatePreferences({
                      favoriteCategories: [value]
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="missionary">Missionary</SelectItem>
                      <SelectItem value="cowgirl">Cowgirl</SelectItem>
                      <SelectItem value="doggy">Doggy Style</SelectItem>
                      <SelectItem value="standing">Standing</SelectItem>
                      <SelectItem value="sitting">Sitting</SelectItem>
                      <SelectItem value="side">Side</SelectItem>
                      <SelectItem value="oral">Oral</SelectItem>
                      <SelectItem value="kinky">Kinky</SelectItem>
                      <SelectItem value="tantric">Tantric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Difficulty</Label>
                  <Select
                    value={preferences.preferredDifficulty[0] || ''}
                    onValueChange={(value) => updatePreferences({
                      preferredDifficulty: [value]
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Physical Considerations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Flexibility</Label>
                  <Select
                    value={preferences.physicalConsiderations.flexibility}
                    onValueChange={(value) => updatePhysicalConsiderations({
                      flexibility: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Strength</Label>
                  <Select
                    value={preferences.physicalConsiderations.strength}
                    onValueChange={(value) => updatePhysicalConsiderations({
                      strength: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fitness Level</Label>
                  <Select
                    value={preferences.physicalConsiderations.fitnessLevel}
                    onValueChange={(value) => updatePhysicalConsiderations({
                      fitnessLevel: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Age Group</Label>
                  <Select
                    value={preferences.physicalConsiderations.ageGroup}
                    onValueChange={(value) => updatePhysicalConsiderations({
                      ageGroup: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="26-35">26-35</SelectItem>
                      <SelectItem value="36-45">36-45</SelectItem>
                      <SelectItem value="46-55">46-55</SelectItem>
                      <SelectItem value="56-65">56-65</SelectItem>
                      <SelectItem value="65+">65+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partner Tab */}
        <TabsContent value="partner" className="space-y-4">
          {preferences.partnerProfile ? (
            <Card>
              <CardHeader>
                <CardTitle>Partner Profile</CardTitle>
                <CardDescription>
                  {preferences.partnerProfile.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={preferences.partnerProfile.name}
                      onChange={(e) => updatePartnerProfile({ name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select
                      value={preferences.partnerProfile.experienceLevel}
                      onValueChange={(value) => updatePartnerProfile({ experienceLevel: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Communication Style</Label>
                    <Select
                      value={preferences.partnerProfile.communicationStyle}
                      onValueChange={(value) => updatePartnerProfile({ communicationStyle: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">Direct</SelectItem>
                        <SelectItem value="gentle">Gentle</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                        <SelectItem value="romantic">Romantic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={preferences.partnerProfile.notes}
                      onChange={(e) => updatePartnerProfile({ notes: e.target.value })}
                      placeholder="Add notes about your partner..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Partner Profile</h3>
                <p className="text-muted-foreground mb-4">
                  Create a partner profile to get better recommendations
                </p>
                <Button onClick={() => {
                  const newPartner: PartnerProfile = {
                    id: `partner-${Date.now()}`,
                    name: 'My Partner',
                    preferences: [],
                    dislikes: [],
                    physicalConsiderations: {
                      flexibility: 'medium',
                      strength: 'medium',
                      limitations: [],
                      injuries: [],
                      medicalConditions: [],
                      ageGroup: '26-35',
                      fitnessLevel: 'intermediate'
                    },
                    communicationStyle: 'romantic',
                    experienceLevel: 'intermediate',
                    favoritePositions: [],
                    avoidedPositions: [],
                    notes: '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  };
                  addPartnerProfile(newPartner);
                }}>
                  Create Partner Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Mood Tab */}
        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Mood</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {(['romantic', 'playful', 'passionate', 'gentle', 'adventurous', 'relaxing', 'energetic', 'intimate', 'kinky', 'wellness'] as MoodType[]).map((mood) => (
                  <Button
                    key={mood}
                    variant={preferences.moodSettings.currentMood === mood ? 'default' : 'outline'}
                    onClick={() => updateMood(mood)}
                    className="capitalize"
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mood History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {preferences.moodSettings.moodHistory.slice(-5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {entry.mood}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {entry.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    {entry.notes && (
                      <span className="text-sm text-muted-foreground">
                        {entry.notes}
                      </span>
                    )}
                  </div>
                ))}
                {preferences.moodSettings.moodHistory.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No mood history yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tag Name</Label>
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter tag name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value=""
                    onValueChange={() => {}}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="position">Position</SelectItem>
                      <SelectItem value="mood">Mood</SelectItem>
                      <SelectItem value="difficulty">Difficulty</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (newTagName) {
                    addCustomTag({
                      name: newTagName,
                      color: newTagColor,
                      category: 'other',
                      isPublic: false
                    });
                    setNewTagName('');
                    setNewTagColor('#3B82F6');
                  }
                }}
                disabled={!newTagName}
              >
                Add Tag
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {preferences.customTags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm">{tag.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCustomTag(tag.id)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                {preferences.customTags.length === 0 && (
                  <p className="text-muted-foreground">No custom tags yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lists Tab */}
        <TabsContent value="lists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Lists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>List Name</Label>
                  <Input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  if (newListName) {
                    addFavoriteList({
                      name: newListName,
                      description: newListDescription,
                      positionIds: [],
                      isPublic: false,
                      tags: []
                    });
                    setNewListName('');
                    setNewListDescription('');
                  }
                }}
                disabled={!newListName}
              >
                Create List
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {preferences.favoriteLists.map((list) => (
                  <div key={list.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <div className="font-medium">{list.name}</div>
                      {list.description && (
                        <div className="text-sm text-muted-foreground">{list.description}</div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {list.positionIds.length} positions
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFavoriteList(list.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
                {preferences.favoriteLists.length === 0 && (
                  <p className="text-muted-foreground">No favorite lists yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Mood Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Track your mood to get better recommendations
                    </p>
                  </div>
                  <Switch
                    checked={settings?.enableMoodTracking || false}
                    onCheckedChange={(checked) => updateSettings?.({ enableMoodTracking: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Physical Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Track physical considerations for better recommendations
                    </p>
                  </div>
                  <Switch
                    checked={settings?.enablePhysicalTracking || false}
                    onCheckedChange={(checked) => updateSettings?.({ enablePhysicalTracking: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Partner Profiles</Label>
                    <p className="text-sm text-muted-foreground">
                      Create and manage partner profiles
                    </p>
                  </div>
                  <Switch
                    checked={settings?.enablePartnerProfiles || false}
                    onCheckedChange={(checked) => updateSettings?.({ enablePartnerProfiles: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Custom Tags</Label>
                    <p className="text-sm text-muted-foreground">
                      Create custom tags for better organization
                    </p>
                  </div>
                  <Switch
                    checked={settings?.enableCustomTags || false}
                    onCheckedChange={(checked) => updateSettings?.({ enableCustomTags: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Recommendations</Label>
                    <p className="text-sm text-muted-foreground">
                      Get personalized position recommendations
                    </p>
                  </div>
                  <Switch
                    checked={settings?.enableRecommendations || false}
                    onCheckedChange={(checked) => updateSettings?.({ enableRecommendations: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

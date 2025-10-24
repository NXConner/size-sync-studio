import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Plus, 
  Search, 
  Bell, 
  Settings,
  Trophy,
  Target,
  Calendar,
  User,
  Globe,
  Lock,
  Eye,
  TrendingUp,
  Activity,
  Star,
  Award,
  Zap,
  BookOpen,
  Camera,
  Video,
  FileText
} from 'lucide-react';
import { useCommunity } from '../hooks/useCommunity';
import { PostType, ChallengeType, EventType } from '../types';

interface CommunityDashboardProps {
  userId: string;
}

export const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ userId }) => {
  const {
    user,
    feed,
    posts,
    challenges,
    groups,
    messages,
    events,
    insights,
    isLoading,
    createPost,
    likePost,
    sharePost,
    addComment,
    createChallenge,
    joinChallenge,
    createGroup,
    joinGroup,
    createEvent,
    registerForEvent,
    followUser,
    unfollowUser,
    getCommunityInsights,
    searchCommunity,
    getFeed
  } = useCommunity(userId);

  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'groups' | 'events' | 'messages' | 'profile' | 'search'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('general');
  const [newPostTitle, setNewPostTitle] = useState('');

  const communityInsights = getCommunityInsights();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Community Access</h3>
        <p className="text-muted-foreground">Please log in to access the community</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community</h2>
          <p className="text-muted-foreground">
            Connect with others and share your journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityInsights.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityInsights.totalPosts}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityInsights.totalLikes}</div>
            <div className="text-sm text-muted-foreground">Likes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityInsights.engagementRate}%</div>
            <div className="text-sm text-muted-foreground">Engagement</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-4">
          {/* Create Post */}
          <Card>
            <CardHeader>
              <CardTitle>Create a Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Post Type</label>
                  <Select value={newPostType} onValueChange={(value) => setNewPostType(value as PostType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                      <SelectItem value="tip">Tip</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Enter post title"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  File
                </Button>
                <Button 
                  onClick={() => {
                    if (newPostContent.trim()) {
                      createPost({
                        authorId: userId,
                        type: newPostType,
                        title: newPostTitle,
                        content: newPostContent,
                        tags: [],
                        isPublic: true,
                        isPinned: false,
                        isFeatured: false
                      });
                      setNewPostContent('');
                      setNewPostTitle('');
                    }
                  }}
                  className="ml-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feed Posts */}
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{post.author.displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        {post.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {post.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePost(post.id)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {post.comments}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sharePost(post.id)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        {post.shares}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Community Challenges</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{challenge.type}</Badge>
                    <Badge className={challenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                                   challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                   challenge.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
                                   'bg-red-100 text-red-800'}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Participants:</span>
                      <span className="font-medium">{challenge.participants}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Completions:</span>
                      <span className="font-medium">{challenge.completions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Ends:</span>
                      <span className="font-medium">{challenge.endDate.toLocaleDateString()}</span>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => joinChallenge(challenge.id)}
                    >
                      Join Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Community Groups</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{group.category}</Badge>
                    {group.isVerified && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Star className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Members:</span>
                      <span className="font-medium">{group.members}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Posts:</span>
                      <span className="font-medium">{group.posts}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {group.isPublic ? (
                        <Globe className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="text-sm">
                        {group.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => joinGroup(group.id)}
                    >
                      Join Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Community Events</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{event.type}</Badge>
                    {event.isVirtual && (
                      <Badge className="bg-purple-100 text-purple-800">
                        Virtual
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Start:</span>
                      <span className="font-medium">{event.startDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>End:</span>
                      <span className="font-medium">{event.endDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Participants:</span>
                      <span className="font-medium">{event.participants}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>Location:</span>
                        <span className="font-medium">{event.location}</span>
                      </div>
                    )}
                    <Button 
                      className="w-full"
                      onClick={() => registerForEvent(event.id)}
                    >
                      Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <h3 className="text-lg font-semibold">Messages</h3>
          <div className="space-y-2">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Message from {message.senderId}</div>
                      <div className="text-sm text-muted-foreground">{message.content}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {message.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{user.displayName}</div>
                  <div className="text-muted-foreground">@{user.username}</div>
                  <div className="text-sm text-muted-foreground">
                    Joined {user.joinDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.stats.followers}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.stats.following}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.stats.posts}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.stats.achievements}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search community..."
                className="flex-1"
              />
              <Button onClick={() => searchCommunity(searchQuery)}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Search for posts, users, groups, challenges, and events
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

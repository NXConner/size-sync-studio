import { useState, useEffect, useCallback } from 'react';
import { 
  CommunityUser, 
  CommunityPost, 
  PostComment, 
  PostLike, 
  PostShare,
  CommunityChallenge,
  UserChallenge,
  CommunityGroup,
  GroupMembership,
  CommunityMessage,
  CommunityEvent,
  EventRegistration,
  CommunityReport,
  CommunityModeration,
  CommunityInsights,
  CommunityFeed,
  CommunitySearch,
  PostType,
  ChallengeType,
  EventType,
  ReportType,
  ModerationAction
} from '../types';

export const useCommunity = (userId: string) => {
  const [user, setUser] = useState<CommunityUser | null>(null);
  const [feed, setFeed] = useState<CommunityFeed | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [insights, setInsights] = useState<CommunityInsights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize community data
  useEffect(() => {
    const initializeCommunity = () => {
      // Mock user data
      const mockUser: CommunityUser = {
        id: userId,
        username: 'user123',
        displayName: 'Community User',
        bio: 'Passionate about wellness and intimacy',
        joinDate: new Date('2024-01-01'),
        isVerified: false,
        isModerator: false,
        isAdmin: false,
        stats: {
          totalSessions: 45,
          totalPositions: 120,
          totalTime: 18000,
          achievements: 15,
          level: 12,
          experience: 250,
          followers: 25,
          following: 18,
          posts: 8,
          likes: 45,
          comments: 32,
          shares: 12
        },
        preferences: {
          showActivity: true,
          showAchievements: true,
          showStats: true,
          allowMessages: true,
          allowFollows: true,
          allowComments: true,
          allowShares: true,
          notificationSettings: {
            newFollowers: true,
            newMessages: true,
            newComments: true,
            newLikes: true,
            newShares: true,
            newAchievements: true,
            newChallenges: true,
            weeklyDigest: true
          }
        },
        privacy: {
          profileVisibility: 'public',
          activityVisibility: 'public',
          statsVisibility: 'public',
          allowFriendRequests: true,
          allowMessages: true,
          allowTags: true
        }
      };

      setUser(mockUser);
      setIsLoading(false);
    };

    initializeCommunity();
  }, [userId]);

  // Create a new post
  const createPost = useCallback((postData: Omit<CommunityPost, 'id' | 'author' | 'likes' | 'comments' | 'shares' | 'views' | 'createdAt' | 'updatedAt'>) => {
    const newPost: CommunityPost = {
      ...postData,
      id: `post-${Date.now()}`,
      author: user!,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPosts(prev => [newPost, ...prev]);
    return newPost;
  }, [user]);

  // Update a post
  const updatePost = useCallback((postId: string, updates: Partial<CommunityPost>) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, ...updates, updatedAt: new Date(), editedAt: new Date() }
        : post
    ));
  }, []);

  // Delete a post
  const deletePost = useCallback((postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  }, []);

  // Like a post
  const likePost = useCallback((postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  }, []);

  // Unlike a post
  const unlikePost = useCallback((postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: Math.max(0, post.likes - 1) }
        : post
    ));
  }, []);

  // Share a post
  const sharePost = useCallback((postId: string, message?: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, shares: post.shares + 1 }
        : post
    ));
  }, []);

  // Add comment to post
  const addComment = useCallback((postId: string, content: string) => {
    const newComment: PostComment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: userId,
      author: user!,
      content,
      likes: 0,
      replies: [],
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));

    return newComment;
  }, [userId, user]);

  // Create a challenge
  const createChallenge = useCallback((challengeData: Omit<CommunityChallenge, 'id' | 'participants' | 'completions' | 'createdAt' | 'updatedAt'>) => {
    const newChallenge: CommunityChallenge = {
      ...challengeData,
      id: `challenge-${Date.now()}`,
      participants: 0,
      completions: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setChallenges(prev => [newChallenge, ...prev]);
    return newChallenge;
  }, []);

  // Join a challenge
  const joinChallenge = useCallback((challengeId: string) => {
    const userChallenge: UserChallenge = {
      id: `user-challenge-${Date.now()}`,
      challengeId,
      userId,
      status: 'in_progress',
      progress: 0,
      startedAt: new Date()
    };

    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, participants: challenge.participants + 1 }
        : challenge
    ));

    return userChallenge;
  }, [userId]);

  // Update challenge progress
  const updateChallengeProgress = useCallback((challengeId: string, progress: number) => {
    // This would update the user's challenge progress
    // For now, just return success
    return true;
  }, []);

  // Complete a challenge
  const completeChallenge = useCallback((challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, completions: challenge.completions + 1 }
        : challenge
    ));
  }, []);

  // Create a group
  const createGroup = useCallback((groupData: Omit<CommunityGroup, 'id' | 'members' | 'posts' | 'createdAt' | 'updatedAt'>) => {
    const newGroup: CommunityGroup = {
      ...groupData,
      id: `group-${Date.now()}`,
      members: 1,
      posts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setGroups(prev => [newGroup, ...prev]);
    return newGroup;
  }, []);

  // Join a group
  const joinGroup = useCallback((groupId: string) => {
    const membership: GroupMembership = {
      id: `membership-${Date.now()}`,
      groupId,
      userId,
      role: 'member',
      joinedAt: new Date(),
      isActive: true
    };

    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, members: group.members + 1 }
        : group
    ));

    return membership;
  }, [userId]);

  // Leave a group
  const leaveGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, members: Math.max(0, group.members - 1) }
        : group
    ));
  }, []);

  // Send a message
  const sendMessage = useCallback((receiverId: string, content: string, type: 'text' | 'image' | 'video' | 'file' = 'text', attachments?: string[]) => {
    const newMessage: CommunityMessage = {
      id: `message-${Date.now()}`,
      senderId: userId,
      receiverId,
      content,
      type,
      attachments,
      isRead: false,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMessages(prev => [newMessage, ...prev]);
    return newMessage;
  }, [userId]);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId: string) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId 
        ? { ...message, isRead: true }
        : message
    ));
  }, []);

  // Create an event
  const createEvent = useCallback((eventData: Omit<CommunityEvent, 'id' | 'participants' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CommunityEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      participants: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  }, []);

  // Register for an event
  const registerForEvent = useCallback((eventId: string) => {
    const registration: EventRegistration = {
      id: `registration-${Date.now()}`,
      eventId,
      userId,
      status: 'registered',
      registeredAt: new Date()
    };

    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, participants: event.participants + 1 }
        : event
    ));

    return registration;
  }, [userId]);

  // Report content
  const reportContent = useCallback((reportData: Omit<CommunityReport, 'id' | 'status' | 'createdAt'>) => {
    const newReport: CommunityReport = {
      ...reportData,
      id: `report-${Date.now()}`,
      status: 'pending',
      createdAt: new Date()
    };

    return newReport;
  }, []);

  // Follow a user
  const followUser = useCallback((targetUserId: string) => {
    if (user) {
      setUser(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          following: prev.stats.following + 1
        }
      } : null);
    }
  }, [user]);

  // Unfollow a user
  const unfollowUser = useCallback((targetUserId: string) => {
    if (user) {
      setUser(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          following: Math.max(0, prev.stats.following - 1)
        }
      } : null);
    }
  }, [user]);

  // Get community insights
  const getCommunityInsights = useCallback((): CommunityInsights => {
    return {
      totalUsers: 1250,
      activeUsers: 850,
      totalPosts: 3200,
      totalComments: 8900,
      totalLikes: 15600,
      totalShares: 2100,
      engagementRate: 78.5,
      topPosts: posts.slice(0, 5),
      topUsers: [],
      trendingTags: ['wellness', 'intimacy', 'communication', 'health', 'relationship'],
      popularCategories: ['missionary', 'cowgirl', 'standing', 'oral', 'tantric'],
      growthMetrics: {
        newUsers: 45,
        newPosts: 120,
        newComments: 340,
        newLikes: 890,
        newShares: 67,
        period: 'weekly',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      }
    };
  }, [posts]);

  // Search community content
  const searchCommunity = useCallback((query: string, filters?: any): CommunitySearch => {
    const results = {
      posts: posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ),
      users: [],
      groups: groups.filter(group => 
        group.name.toLowerCase().includes(query.toLowerCase()) ||
        group.description.toLowerCase().includes(query.toLowerCase())
      ),
      challenges: challenges.filter(challenge => 
        challenge.title.toLowerCase().includes(query.toLowerCase()) ||
        challenge.description.toLowerCase().includes(query.toLowerCase())
      ),
      events: events.filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
      )
    };

    return {
      query,
      filters: filters || {},
      results,
      totalResults: results.posts.length + results.users.length + results.groups.length + results.challenges.length + results.events.length,
      searchTime: 150
    };
  }, [posts, groups, challenges, events]);

  // Get feed
  const getFeed = useCallback((limit: number = 20, cursor?: string): CommunityFeed => {
    const feedPosts = posts.slice(0, limit);
    
    return {
      posts: feedPosts,
      hasMore: posts.length > limit,
      nextCursor: posts.length > limit ? `cursor-${limit}` : undefined,
      lastUpdated: new Date()
    };
  }, [posts]);

  // Update user preferences
  const updateUserPreferences = useCallback((updates: Partial<CommunityUser['preferences']>) => {
    if (user) {
      setUser(prev => prev ? {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...updates
        }
      } : null);
    }
  }, [user]);

  // Update privacy settings
  const updatePrivacySettings = useCallback((updates: Partial<CommunityUser['privacy']>) => {
    if (user) {
      setUser(prev => prev ? {
        ...prev,
        privacy: {
          ...prev.privacy,
          ...updates
        }
      } : null);
    }
  }, [user]);

  return {
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
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    sharePost,
    addComment,
    createChallenge,
    joinChallenge,
    updateChallengeProgress,
    completeChallenge,
    createGroup,
    joinGroup,
    leaveGroup,
    sendMessage,
    markMessageAsRead,
    createEvent,
    registerForEvent,
    reportContent,
    followUser,
    unfollowUser,
    getCommunityInsights,
    searchCommunity,
    getFeed,
    updateUserPreferences,
    updatePrivacySettings
  };
};

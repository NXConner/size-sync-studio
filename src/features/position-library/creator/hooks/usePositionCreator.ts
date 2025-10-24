import { useState, useEffect, useCallback } from 'react';
import { 
  CustomPosition, 
  PositionDraft, 
  CreatorSettings, 
  CreatorStats, 
  CreatorActivity,
  PositionImage,
  PositionVideo,
  PositionTemplate,
  PositionVersion,
  PositionAnalytics
} from '../types';

export const usePositionCreator = (userId: string) => {
  const [drafts, setDrafts] = useState<PositionDraft[]>([]);
  const [positions, setPositions] = useState<CustomPosition[]>([]);
  const [settings, setSettings] = useState<CreatorSettings | null>(null);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [currentDraft, setCurrentDraft] = useState<PositionDraft | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize creator settings
  useEffect(() => {
    const initializeSettings = () => {
      const defaultSettings: CreatorSettings = {
        allowPublicSharing: true,
        allowPartnerSharing: true,
        autoSave: true,
        saveInterval: 30, // 30 seconds
        maxImages: 10,
        maxVideos: 3,
        maxImageSize: 10, // 10 MB
        maxVideoSize: 100, // 100 MB
        allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        allowedVideoTypes: ['mp4', 'mov', 'avi', 'webm'],
        requireVerification: false,
        enableComments: true,
        enableRatings: true
      };

      setSettings(defaultSettings);
      setIsLoading(false);
    };

    initializeSettings();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!settings?.autoSave || !currentDraft) return;

    const interval = setInterval(() => {
      saveDraft(currentDraft);
    }, settings.saveInterval * 1000);

    return () => clearInterval(interval);
  }, [settings, currentDraft]);

  // Create new draft
  const createNewDraft = useCallback((template?: PositionTemplate) => {
    const newDraft: PositionDraft = {
      id: `draft-${Date.now()}`,
      name: template?.name || '',
      description: template?.description || '',
      category: template?.category || '',
      difficulty: template?.difficulty || 'beginner',
      instructions: template?.instructions || [],
      tips: template?.tips || [],
      benefits: template?.benefits || [],
      requirements: template?.requirements || [],
      duration: template?.duration || { min: 5, max: 30 },
      tags: template?.tags || [],
      images: [],
      videos: [],
      isPublic: false,
      lastSaved: new Date(),
      version: 1
    };

    setDrafts(prev => [...prev, newDraft]);
    setCurrentDraft(newDraft);
    return newDraft;
  }, []);

  // Update draft
  const updateDraft = useCallback((draftId: string, updates: Partial<PositionDraft>) => {
    setDrafts(prev => prev.map(draft => 
      draft.id === draftId 
        ? { 
            ...draft, 
            ...updates, 
            lastSaved: new Date(),
            version: draft.version + 1
          }
        : draft
    ));

    if (currentDraft?.id === draftId) {
      setCurrentDraft(prev => prev ? { ...prev, ...updates, lastSaved: new Date(), version: prev.version + 1 } : null);
    }
  }, [currentDraft]);

  // Save draft
  const saveDraft = useCallback((draft: PositionDraft) => {
    setIsSaving(true);
    
    // Simulate save operation
    setTimeout(() => {
      setDrafts(prev => prev.map(d => 
        d.id === draft.id 
          ? { ...draft, lastSaved: new Date() }
          : d
      ));
      setIsSaving(false);
    }, 1000);
  }, []);

  // Publish position
  const publishPosition = useCallback((draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (!draft) return null;

    const newPosition: CustomPosition = {
      id: `position-${Date.now()}`,
      name: draft.name,
      description: draft.description,
      category: draft.category,
      difficulty: draft.difficulty as any,
      instructions: draft.instructions,
      tips: draft.tips,
      benefits: draft.benefits,
      requirements: draft.requirements,
      duration: draft.duration,
      tags: draft.tags,
      images: draft.images,
      videos: draft.videos,
      isPublic: draft.isPublic,
      isVerified: false,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      views: 0,
      shares: 0,
      rating: 0,
      reviewCount: 0
    };

    setPositions(prev => [...prev, newPosition]);
    
    // Remove draft after publishing
    setDrafts(prev => prev.filter(d => d.id !== draftId));
    setCurrentDraft(null);

    // Add activity
    addActivity('created', newPosition.id, newPosition.name);

    return newPosition;
  }, [drafts, userId]);

  // Update position
  const updatePosition = useCallback((positionId: string, updates: Partial<CustomPosition>) => {
    setPositions(prev => prev.map(pos => 
      pos.id === positionId 
        ? { ...pos, ...updates, updatedAt: new Date() }
        : pos
    ));

    // Add activity
    addActivity('updated', positionId, updates.name || 'Position');
  }, []);

  // Delete position
  const deletePosition = useCallback((positionId: string) => {
    setPositions(prev => prev.filter(pos => pos.id !== positionId));
    
    // Add activity
    addActivity('deleted', positionId, 'Position');
  }, []);

  // Add image to draft
  const addImageToDraft = useCallback((draftId: string, image: Omit<PositionImage, 'id' | 'uploadedAt'>) => {
    const newImage: PositionImage = {
      ...image,
      id: `image-${Date.now()}`,
      uploadedAt: new Date()
    };

    updateDraft(draftId, {
      images: [...(drafts.find(d => d.id === draftId)?.images || []), newImage]
    });
  }, [drafts, updateDraft]);

  // Remove image from draft
  const removeImageFromDraft = useCallback((draftId: string, imageId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (!draft) return;

    updateDraft(draftId, {
      images: draft.images.filter(img => img.id !== imageId)
    });
  }, [drafts, updateDraft]);

  // Add video to draft
  const addVideoToDraft = useCallback((draftId: string, video: Omit<PositionVideo, 'id' | 'uploadedAt'>) => {
    const newVideo: PositionVideo = {
      ...video,
      id: `video-${Date.now()}`,
      uploadedAt: new Date()
    };

    updateDraft(draftId, {
      videos: [...(drafts.find(d => d.id === draftId)?.videos || []), newVideo]
    });
  }, [drafts, updateDraft]);

  // Remove video from draft
  const removeVideoFromDraft = useCallback((draftId: string, videoId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (!draft) return;

    updateDraft(draftId, {
      videos: draft.videos.filter(vid => vid.id !== videoId)
    });
  }, [drafts, updateDraft]);

  // Add activity
  const addActivity = useCallback((type: CreatorActivity['type'], positionId: string, positionName: string, details?: string) => {
    const activity: CreatorActivity = {
      id: `activity-${Date.now()}`,
      type,
      positionId,
      positionName,
      timestamp: new Date(),
      details
    };

    setStats(prev => prev ? {
      ...prev,
      recentActivity: [activity, ...prev.recentActivity.slice(0, 9)]
    } : null);
  }, []);

  // Get position analytics
  const getPositionAnalytics = useCallback((positionId: string): PositionAnalytics | null => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return null;

    return {
      positionId,
      views: position.views,
      likes: position.likes,
      shares: position.shares,
      saves: 0, // This would be calculated from actual data
      ratings: [], // This would be calculated from actual data
      averageRating: position.rating,
      demographics: {
        ageGroups: {},
        genders: {},
        locations: {}
      },
      engagement: {
        timeSpent: 0,
        completionRate: 0,
        returnRate: 0
      },
      feedback: {
        positive: 0,
        negative: 0,
        suggestions: []
      }
    };
  }, [positions]);

  // Get creator stats
  const getCreatorStats = useCallback((): CreatorStats => {
    const totalPositions = positions.length;
    const publicPositions = positions.filter(p => p.isPublic).length;
    const privatePositions = totalPositions - publicPositions;
    const totalViews = positions.reduce((sum, pos) => sum + pos.views, 0);
    const totalLikes = positions.reduce((sum, pos) => sum + pos.likes, 0);
    const totalShares = positions.reduce((sum, pos) => sum + pos.shares, 0);
    const averageRating = positions.length > 0 
      ? positions.reduce((sum, pos) => sum + pos.rating, 0) / positions.length 
      : 0;
    const mostPopularPosition = positions.reduce((most, current) => 
      current.views > most.views ? current : most
    , positions[0] || null);

    return {
      totalPositions,
      publicPositions,
      privatePositions,
      totalViews,
      totalLikes,
      totalShares,
      averageRating,
      mostPopularPosition,
      recentActivity: []
    };
  }, [positions]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<CreatorSettings>) => {
    setSettings(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Get templates
  const getTemplates = useCallback((): PositionTemplate[] => {
    return [
      {
        id: 'missionary-template',
        name: 'Missionary Template',
        description: 'Basic missionary position template',
        category: 'missionary',
        difficulty: 'beginner',
        instructions: [
          'Partner lies on their back',
          'You position yourself between their legs',
          'Support your weight on your arms',
          'Maintain eye contact'
        ],
        tips: [
          'Use pillows for comfort',
          'Communicate about what feels good',
          'Vary your rhythm'
        ],
        benefits: [
          'Intimate eye contact',
          'Easy to kiss and talk',
          'Good for emotional connection'
        ],
        requirements: [
          'Comfortable surface',
          'Good communication',
          'Basic flexibility'
        ],
        duration: { min: 5, max: 30 },
        tags: ['intimate', 'romantic', 'beginner']
      },
      {
        id: 'cowgirl-template',
        name: 'Cowgirl Template',
        description: 'Basic cowgirl position template',
        category: 'cowgirl',
        difficulty: 'beginner',
        instructions: [
          'You lie on your back',
          'Partner straddles you',
          'They control the movement',
          'Support their hips with your hands'
        ],
        tips: [
          'Let them guide the rhythm',
          'Use your hands for support',
          'Communicate about comfort'
        ],
        benefits: [
          'Partner has control',
          'Good for clitoral stimulation',
          'Intimate eye contact'
        ],
        requirements: [
          'Good knee strength',
          'Hip flexibility',
          'Communication skills'
        ],
        duration: { min: 5, max: 30 },
        tags: ['control', 'intimate', 'beginner']
      }
    ];
  }, []);

  // Validate position
  const validatePosition = useCallback((draft: PositionDraft): string[] => {
    const errors: string[] = [];

    if (!draft.name.trim()) {
      errors.push('Position name is required');
    }

    if (!draft.description.trim()) {
      errors.push('Position description is required');
    }

    if (!draft.category) {
      errors.push('Position category is required');
    }

    if (draft.instructions.length === 0) {
      errors.push('At least one instruction is required');
    }

    if (draft.duration.min < 1) {
      errors.push('Minimum duration must be at least 1 minute');
    }

    if (draft.duration.max < draft.duration.min) {
      errors.push('Maximum duration must be greater than minimum duration');
    }

    if (draft.images.length > (settings?.maxImages || 10)) {
      errors.push(`Maximum ${settings?.maxImages || 10} images allowed`);
    }

    if (draft.videos.length > (settings?.maxVideos || 3)) {
      errors.push(`Maximum ${settings?.maxVideos || 3} videos allowed`);
    }

    return errors;
  }, [settings]);

  return {
    drafts,
    positions,
    settings,
    stats,
    currentDraft,
    isLoading,
    isSaving,
    createNewDraft,
    updateDraft,
    saveDraft,
    publishPosition,
    updatePosition,
    deletePosition,
    addImageToDraft,
    removeImageFromDraft,
    addVideoToDraft,
    removeVideoFromDraft,
    getPositionAnalytics,
    getCreatorStats,
    updateSettings,
    getTemplates,
    validatePosition
  };
};

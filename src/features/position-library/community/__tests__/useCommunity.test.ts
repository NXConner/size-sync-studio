import { renderHook, act } from '@testing-library/react';
import { useCommunity } from '../hooks/useCommunity';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCommunity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with empty community data', () => {
    const { result } = renderHook(() => useCommunity());
    
    expect(result.current.posts).toEqual([]);
    expect(result.current.comments).toEqual([]);
    expect(result.current.likes).toEqual([]);
    expect(result.current.users).toEqual([]);
  });

  it('should load community data from localStorage', () => {
    const mockData = {
      posts: [
        {
          id: '1',
          title: 'Test Post',
          content: 'Test content',
          author: 'user1',
          tags: ['test'],
          likes: 5,
          comments: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      comments: [],
      likes: [],
      users: []
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

    const { result } = renderHook(() => useCommunity());
    
    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].title).toBe('Test Post');
  });

  it('should create post', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      author: 'user1',
      tags: ['test'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData);
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].title).toBe('Test Post');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should update post', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      author: 'user1',
      tags: ['test'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData);
    });

    const postId = result.current.posts[0].id;

    act(() => {
      result.current.updatePost(postId, { title: 'Updated Post' });
    });

    expect(result.current.posts[0].title).toBe('Updated Post');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should delete post', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      author: 'user1',
      tags: ['test'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData);
    });

    const postId = result.current.posts[0].id;

    act(() => {
      result.current.deletePost(postId);
    });

    expect(result.current.posts).toHaveLength(0);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should add comment', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      author: 'user1',
      tags: ['test'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData);
    });

    const postId = result.current.posts[0].id;

    const commentData = {
      content: 'Test comment',
      author: 'user2',
      postId: postId
    };

    act(() => {
      result.current.addComment(commentData);
    });

    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].content).toBe('Test comment');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should like post', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      author: 'user1',
      tags: ['test'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData);
    });

    const postId = result.current.posts[0].id;

    act(() => {
      result.current.likePost(postId, 'user2');
    });

    expect(result.current.likes).toHaveLength(1);
    expect(result.current.likes[0].postId).toBe(postId);
    expect(result.current.likes[0].userId).toBe('user2');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should unlike post', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      author: 'user1',
      tags: ['test'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData);
    });

    const postId = result.current.posts[0].id;

    act(() => {
      result.current.likePost(postId, 'user2');
    });

    act(() => {
      result.current.unlikePost(postId, 'user2');
    });

    expect(result.current.likes).toHaveLength(0);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should get posts by author', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData1 = {
      title: 'Test Post 1',
      content: 'Test content',
      author: 'user1',
      tags: ['test'],
      isPublic: true
    };

    const postData2 = {
      title: 'Test Post 2',
      content: 'Test content',
      author: 'user2',
      tags: ['test'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData1);
      result.current.createPost(postData2);
    });

    const user1Posts = result.current.getPostsByAuthor('user1');
    expect(user1Posts).toHaveLength(1);
    expect(user1Posts[0].title).toBe('Test Post 1');
  });

  it('should get posts by tags', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData1 = {
      title: 'Test Post 1',
      content: 'Test content',
      author: 'user1',
      tags: ['test', 'beginner'],
      isPublic: true
    };

    const postData2 = {
      title: 'Test Post 2',
      content: 'Test content',
      author: 'user2',
      tags: ['advanced'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData1);
      result.current.createPost(postData2);
    });

    const beginnerPosts = result.current.getPostsByTags(['beginner']);
    expect(beginnerPosts).toHaveLength(1);
    expect(beginnerPosts[0].title).toBe('Test Post 1');
  });

  it('should search posts', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData1 = {
      title: 'Romantic Positions',
      content: 'Test content',
      author: 'user1',
      tags: ['test'],
      isPublic: true
    };

    const postData2 = {
      title: 'Playful Positions',
      content: 'Test content',
      author: 'user2',
      tags: ['test'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData1);
      result.current.createPost(postData2);
    });

    const searchResults = result.current.searchPosts('Romantic');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].title).toBe('Romantic Positions');
  });

  it('should get trending posts', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData1 = {
      title: 'Popular Post',
      content: 'Test content',
      author: 'user1',
      tags: ['test'],
      isPublic: true
    };

    const postData2 = {
      title: 'Less Popular Post',
      content: 'Test content',
      author: 'user2',
      tags: ['test'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData1);
      result.current.createPost(postData2);
    });

    const postId1 = result.current.posts[0].id;

    // Add more likes to first post
    act(() => {
      result.current.likePost(postId1, 'user1');
      result.current.likePost(postId1, 'user2');
      result.current.likePost(postId1, 'user3');
    });

    const trendingPosts = result.current.getTrendingPosts();
    expect(trendingPosts).toHaveLength(2);
    expect(trendingPosts[0].title).toBe('Popular Post');
  });

  it('should reset community data', () => {
    const { result } = renderHook(() => useCommunity());
    
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      author: 'user1',
      tags: ['test'],
      isPublic: true
    };

    act(() => {
      result.current.createPost(postData);
    });

    act(() => {
      result.current.resetCommunityData();
    });

    expect(result.current.posts).toEqual([]);
    expect(result.current.comments).toEqual([]);
    expect(result.current.likes).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});

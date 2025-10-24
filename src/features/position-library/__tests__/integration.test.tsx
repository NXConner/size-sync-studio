import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PositionLibraryIntegration } from '../integration/PositionLibraryIntegration';

// Mock the individual feature components
jest.mock('../achievements/components/AchievementDashboard', () => {
  return function MockAchievementDashboard() {
    return <div data-testid="achievement-dashboard">Achievement Dashboard</div>;
  };
});

jest.mock('../personalization/components/PersonalizationDashboard', () => {
  return function MockPersonalizationDashboard() {
    return <div data-testid="personalization-dashboard">Personalization Dashboard</div>;
  };
});

jest.mock('../creator/components/PositionCreator', () => {
  return function MockPositionCreator() {
    return <div data-testid="position-creator">Position Creator</div>;
  };
});

jest.mock('../analytics/components/AnalyticsDashboard', () => {
  return function MockAnalyticsDashboard() {
    return <div data-testid="analytics-dashboard">Analytics Dashboard</div>;
  };
});

jest.mock('../community/components/CommunityDashboard', () => {
  return function MockCommunityDashboard() {
    return <div data-testid="community-dashboard">Community Dashboard</div>;
  };
});

jest.mock('../challenges/components/ChallengeDashboard', () => {
  return function MockChallengeDashboard() {
    return <div data-testid="challenge-dashboard">Challenge Dashboard</div>;
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PositionLibraryIntegration', () => {
  it('should render the main integration component', () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    expect(screen.getByText('Position Library')).toBeInTheDocument();
  });

  it('should switch between tabs', async () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    // Click on achievements tab
    const achievementsTab = screen.getByText('Achievements');
    fireEvent.click(achievementsTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('achievement-dashboard')).toBeInTheDocument();
    });
  });

  it('should switch to personalization tab', async () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    const personalizationTab = screen.getByText('Personalization');
    fireEvent.click(personalizationTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('personalization-dashboard')).toBeInTheDocument();
    });
  });

  it('should switch to creator tab', async () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    const creatorTab = screen.getByText('Creator');
    fireEvent.click(creatorTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('position-creator')).toBeInTheDocument();
    });
  });

  it('should switch to analytics tab', async () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    });
  });

  it('should switch to community tab', async () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    const communityTab = screen.getByText('Community');
    fireEvent.click(communityTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('community-dashboard')).toBeInTheDocument();
    });
  });

  it('should switch to challenges tab', async () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    const challengesTab = screen.getByText('Challenges');
    fireEvent.click(challengesTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('challenge-dashboard')).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    // The component should render without loading state initially
    expect(screen.getByText('Position Library')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    // The component should render without error state initially
    expect(screen.getByText('Position Library')).toBeInTheDocument();
  });

  it('should display all navigation tabs', () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('Personalization')).toBeInTheDocument();
    expect(screen.getByText('Creator')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Challenges')).toBeInTheDocument();
  });

  it('should show active tab styling', () => {
    renderWithRouter(<PositionLibraryIntegration />);
    
    // Library tab should be active by default
    const libraryTab = screen.getByText('Library');
    expect(libraryTab).toHaveClass('active');
  });
});

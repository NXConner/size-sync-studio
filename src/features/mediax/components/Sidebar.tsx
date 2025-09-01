
import React from 'react';
import { Folder, Upload, Star, Clock, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean;
  collections: string[];
  selectedCollection: string;
  onCollectionChange: (collection: string) => void;
  onUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo((props) => {
  const {
    isOpen,
    collections,
    selectedCollection,
    onCollectionChange,
    onUpload,
  } = props;
  const getCollectionIcon = (collection: string) => {
    switch (collection) {
      case 'favorites':
        return Star;
      case 'recent':
        return Clock;
      case 'all':
        return Folder;
      default:
        return Folder;
    }
  };

  const getCollectionLabel = (collection: string) => {
    return collection.charAt(0).toUpperCase() + collection.slice(1);
  };

  const navigate = useNavigate()
  return (
    <div
      className={`fixed left-0 top-[73px] h-[calc(100vh-73px)] bg-gray-800/95 backdrop-blur-sm border-r border-gray-700 transition-transform duration-300 z-30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}
    >
      <div className="p-4 space-y-4">
        {/* Upload Button */}
        <button
          aria-label="Upload media"
          onClick={onUpload}
          className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <Upload size={20} />
          <span className="font-medium">Upload Media</span>
        </button>

        

        {/* Collections */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Collections
          </h3>
          <div className="space-y-1">
            {collections.map((collection) => {
              const Icon = getCollectionIcon(collection);
              const isSelected = selectedCollection === collection;
              
              return (
                <button
                  key={collection}
                  onClick={() => onCollectionChange(collection)}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{getCollectionLabel(collection)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy Section */}
        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Privacy
          </h3>
          <div className="space-y-1">
            <button onClick={() => navigate('/settings?tab=security')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-300 hover:text-white">
              <Shield size={18} />
              <span className="font-medium">Security Settings</span>
            </button>
            <button onClick={() => navigate('/settings?tab=preferences')} className="w-full flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-300 hover:text-white">
              <Settings size={18} />
              <span className="font-medium">Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

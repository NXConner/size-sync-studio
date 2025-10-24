import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Minus, 
  Save, 
  Eye, 
  Upload, 
  Trash2, 
  Edit, 
  Check,
  AlertCircle,
  Image,
  Video,
  Clock,
  Tag,
  Star,
  Users,
  Globe,
  Lock
} from 'lucide-react';
import { usePositionCreator } from '../hooks/usePositionCreator';
import { PositionDraft, PositionImage, PositionVideo } from '../types';

interface PositionCreatorProps {
  userId: string;
  onSave?: (draft: PositionDraft) => void;
  onPublish?: (position: any) => void;
}

export const PositionCreator: React.FC<PositionCreatorProps> = ({
  userId,
  onSave,
  onPublish
}) => {
  const {
    drafts,
    positions,
    settings,
    currentDraft,
    isLoading,
    isSaving,
    createNewDraft,
    updateDraft,
    saveDraft,
    publishPosition,
    addImageToDraft,
    removeImageFromDraft,
    addVideoToDraft,
    removeVideoFromDraft,
    getTemplates,
    validatePosition
  } = usePositionCreator(userId);

  const [activeTab, setActiveTab] = useState<'basic' | 'instructions' | 'media' | 'settings' | 'preview'>('basic');
  const [newInstruction, setNewInstruction] = useState('');
  const [newTip, setNewTip] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newTag, setNewTag] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const templates = getTemplates();

  // Create new draft if none exists
  React.useEffect(() => {
    if (!currentDraft && drafts.length === 0) {
      createNewDraft();
    }
  }, [currentDraft, drafts.length, createNewDraft]);

  // Validate current draft
  React.useEffect(() => {
    if (currentDraft) {
      const errors = validatePosition(currentDraft);
      setValidationErrors(errors);
    }
  }, [currentDraft, validatePosition]);

  const handleSave = () => {
    if (currentDraft) {
      saveDraft(currentDraft);
      onSave?.(currentDraft);
    }
  };

  const handlePublish = () => {
    if (currentDraft && validationErrors.length === 0) {
      const position = publishPosition(currentDraft.id);
      onPublish?.(position);
    }
  };

  const addInstruction = () => {
    if (newInstruction.trim() && currentDraft) {
      updateDraft(currentDraft.id, {
        instructions: [...currentDraft.instructions, newInstruction.trim()]
      });
      setNewInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    if (currentDraft) {
      updateDraft(currentDraft.id, {
        instructions: currentDraft.instructions.filter((_, i) => i !== index)
      });
    }
  };

  const addTip = () => {
    if (newTip.trim() && currentDraft) {
      updateDraft(currentDraft.id, {
        tips: [...currentDraft.tips, newTip.trim()]
      });
      setNewTip('');
    }
  };

  const removeTip = (index: number) => {
    if (currentDraft) {
      updateDraft(currentDraft.id, {
        tips: currentDraft.tips.filter((_, i) => i !== index)
      });
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim() && currentDraft) {
      updateDraft(currentDraft.id, {
        benefits: [...currentDraft.benefits, newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    if (currentDraft) {
      updateDraft(currentDraft.id, {
        benefits: currentDraft.benefits.filter((_, i) => i !== index)
      });
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim() && currentDraft) {
      updateDraft(currentDraft.id, {
        requirements: [...currentDraft.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    if (currentDraft) {
      updateDraft(currentDraft.id, {
        requirements: currentDraft.requirements.filter((_, i) => i !== index)
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && currentDraft) {
      updateDraft(currentDraft.id, {
        tags: [...currentDraft.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    if (currentDraft) {
      updateDraft(currentDraft.id, {
        tags: currentDraft.tags.filter((_, i) => i !== index)
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentDraft) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const image: Omit<PositionImage, 'id' | 'uploadedAt'> = {
          url: e.target?.result as string,
          caption: '',
          isPrivate: true,
          size: file.size,
          type: 'instruction'
        };
        addImageToDraft(currentDraft.id, image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentDraft) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const video: Omit<PositionVideo, 'id' | 'uploadedAt'> = {
          url: e.target?.result as string,
          caption: '',
          isPrivate: true,
          duration: 0,
          size: file.size,
          type: 'tutorial'
        };
        addVideoToDraft(currentDraft.id, video);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading creator...</p>
        </div>
      </div>
    );
  }

  if (!currentDraft) {
    return (
      <div className="text-center py-8">
        <Edit className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Draft Available</h3>
        <p className="text-muted-foreground mb-4">Create a new position to get started</p>
        <Button onClick={() => createNewDraft()}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Position
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Position Creator</h2>
          <p className="text-muted-foreground">
            Create and customize your own positions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <Badge variant="outline" className="text-blue-600">
              <Save className="h-3 w-3 mr-1" />
              Saving...
            </Badge>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={validationErrors.length > 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-800">Please fix the following errors:</h4>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="instructions" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Instructions
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details for your position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position Name *</Label>
                  <Input
                    value={currentDraft.name}
                    onChange={(e) => updateDraft(currentDraft.id, { name: e.target.value })}
                    placeholder="Enter position name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={currentDraft.category}
                    onValueChange={(value) => updateDraft(currentDraft.id, { category: value })}
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
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty *</Label>
                  <Select
                    value={currentDraft.difficulty}
                    onValueChange={(value) => updateDraft(currentDraft.id, { difficulty: value })}
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

                <div className="space-y-2">
                  <Label>Duration Range</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={currentDraft.duration.min}
                      onChange={(e) => updateDraft(currentDraft.id, { 
                        duration: { ...currentDraft.duration, min: parseInt(e.target.value) || 0 }
                      })}
                      placeholder="Min"
                      className="w-20"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      value={currentDraft.duration.max}
                      onChange={(e) => updateDraft(currentDraft.id, { 
                        duration: { ...currentDraft.duration, max: parseInt(e.target.value) || 0 }
                      })}
                      placeholder="Max"
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={currentDraft.description}
                  onChange={(e) => updateDraft(currentDraft.id, { description: e.target.value })}
                  placeholder="Describe the position and its benefits"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentDraft.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(index)}
                        className="h-4 w-4 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>
                Provide step-by-step instructions for the position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Step-by-Step Instructions *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newInstruction}
                    onChange={(e) => setNewInstruction(e.target.value)}
                    placeholder="Add an instruction step"
                    onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
                  />
                  <Button onClick={addInstruction} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentDraft.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <span className="flex-1 text-sm">{instruction}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tips</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newTip}
                    onChange={(e) => setNewTip(e.target.value)}
                    placeholder="Add a tip"
                    onKeyPress={(e) => e.key === 'Enter' && addTip()}
                  />
                  <Button onClick={addTip} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentDraft.tips.map((tip, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="text-sm">💡</span>
                      <span className="flex-1 text-sm">{tip}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTip(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Benefits</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Add a benefit"
                    onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                  />
                  <Button onClick={addBenefit} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentDraft.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="text-sm">✅</span>
                      <span className="flex-1 text-sm">{benefit}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement"
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button onClick={addRequirement} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentDraft.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="text-sm">📋</span>
                      <span className="flex-1 text-sm">{requirement}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>
                Add images and videos to enhance your position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Images</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-muted-foreground rounded-lg p-4 text-center hover:border-primary transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload images or drag and drop
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {currentDraft.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt="Position image"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImageFromDraft(currentDraft.id, image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Videos</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <Label htmlFor="video-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-muted-foreground rounded-lg p-4 text-center hover:border-primary transition-colors">
                        <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload videos or drag and drop
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {currentDraft.videos.map((video) => (
                      <div key={video.id} className="relative group">
                        <video
                          src={video.url}
                          className="w-full h-32 object-cover rounded-lg"
                          controls
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeVideoFromDraft(currentDraft.id, video.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position Settings</CardTitle>
              <CardDescription>
                Configure privacy and sharing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Make Public</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to discover and use this position
                  </p>
                </div>
                <Switch
                  checked={currentDraft.isPublic}
                  onCheckedChange={(checked) => updateDraft(currentDraft.id, { isPublic: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others comment on this position
                  </p>
                </div>
                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Ratings</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others rate this position
                  </p>
                </div>
                <Switch
                  checked={true}
                  onCheckedChange={() => {}}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position Preview</CardTitle>
              <CardDescription>
                See how your position will appear to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{currentDraft.name}</h3>
                  <p className="text-muted-foreground">{currentDraft.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentDraft.category}</Badge>
                  <Badge variant="outline">{currentDraft.difficulty}</Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentDraft.duration.min}-{currentDraft.duration.max} min
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {currentDraft.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm">{instruction}</li>
                    ))}
                  </ol>
                </div>

                {currentDraft.tips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Tips:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentDraft.tips.map((tip, index) => (
                        <li key={index} className="text-sm">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentDraft.benefits.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Benefits:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentDraft.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentDraft.requirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Requirements:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentDraft.requirements.map((requirement, index) => (
                        <li key={index} className="text-sm">{requirement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentDraft.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Tags:</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentDraft.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

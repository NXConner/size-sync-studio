import { useState } from "react";
import { SessionPresetCard } from "@/components/SessionPresetCard";
import { sessionPresets } from "@/data/sessionPresets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
// import { SessionPreset } from "@/types";
import { useNavigate } from "react-router-dom";

export default function Sessions() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredPresets = sessionPresets.filter((preset) => {
    const matchesSearch =
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === "all" || preset.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === "all" || preset.category === selectedCategory;

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const handleStartSession = (_presetId: string) => {
    navigate("/run-session");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Training Sessions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our carefully designed routines. Each session includes safety guidelines,
            proper pressure levels, and rest periods for optimal results.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All Categories</option>
              <option value="length">Length</option>
              <option value="girth">Girth</option>
              <option value="both">Both</option>
              <option value="testicles">Testicles</option>
            </select>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive mb-2">⚠️ Important Safety Notice</h3>
          <p className="text-sm text-destructive-foreground">
            Always read safety guidelines before starting any session. Stop immediately if you
            experience pain, discomfort, or unusual sensations. These routines are for educational
            purposes only.
          </p>
        </div>

        {/* Session Presets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map((preset) => (
            <SessionPresetCard key={preset.id} preset={preset} onStart={handleStartSession} />
          ))}
        </div>

        {filteredPresets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No sessions found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedDifficulty("all");
                setSelectedCategory("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Camera, Calendar, Ruler, Search, Trash2 } from "lucide-react";
import { getMeasurements, deleteMeasurement, getPhoto } from "@/utils/storage";
import { Measurement } from "@/types";

export default function Gallery() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [filteredMeasurements, setFilteredMeasurements] = useState<Measurement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMeasurements();
  }, []);

  useEffect(() => {
    filterMeasurements();
  }, [measurements, searchTerm, selectedFilter]);

  const loadMeasurements = async () => {
    const data = getMeasurements().filter((m) => m.photoUrl);
    setMeasurements(data);

    // Load photo URLs
    const urls: Record<string, string> = {};
    for (const measurement of data) {
      if (measurement.photoUrl) {
        try {
          const blob = await getPhoto(measurement.id);
          if (blob) {
            urls[measurement.id] = URL.createObjectURL(blob);
          }
        } catch (error) {
          console.error("Error loading photo:", error);
        }
      }
    }
    setPhotoUrls(urls);
  };

  const filterMeasurements = () => {
    let filtered = measurements;

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(m.date).toLocaleDateString().includes(searchTerm),
      );
    }

    if (selectedFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (selectedFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((m) => new Date(m.date) >= filterDate);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter((m) => new Date(m.date) >= filterDate);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter((m) => new Date(m.date) >= filterDate);
          break;
        case "sessions":
          filtered = filtered.filter((m) => m.sessionId);
          break;
        case "manual":
          filtered = filtered.filter((m) => !m.sessionId);
          break;
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredMeasurements(filtered);
  };

  const handleDelete = async (measurementId: string) => {
    if (confirm("Are you sure you want to delete this photo and measurement?")) {
      deleteMeasurement(measurementId);

      // Revoke object URL to free memory
      if (photoUrls[measurementId]) {
        URL.revokeObjectURL(photoUrls[measurementId]);
      }

      loadMeasurements();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Camera className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Progress Gallery
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your progress visually with timestamped photos and measurements. Your journey
            documented with precision and privacy.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Photos</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="sessions">Session Photos</option>
            <option value="manual">Manual Photos</option>
          </select>
        </div>

        {/* Stats */}
        {measurements.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="gradient-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{measurements.length}</div>
                <div className="text-sm text-muted-foreground">Total Photos</div>
              </CardContent>
            </Card>
            <Card className="gradient-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">
                  {measurements.filter((m) => m.sessionId).length}
                </div>
                <div className="text-sm text-muted-foreground">Session Photos</div>
              </CardContent>
            </Card>
            <Card className="gradient-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">
                  {
                    measurements.filter(
                      (m) => new Date(m.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    ).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </CardContent>
            </Card>
            <Card className="gradient-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {measurements.length > 0
                    ? Math.max(...measurements.map((m) => m.length)).toFixed(1)
                    : "0"}
                  "
                </div>
                <div className="text-sm text-muted-foreground">Best Length</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Photo Grid */}
        {filteredMeasurements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeasurements.map((measurement) => (
              <Card key={measurement.id} className="gradient-card shadow-card group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm">{formatDate(measurement.date)}</span>
                      </CardTitle>
                      <div className="flex space-x-2">
                        {measurement.sessionId && (
                          <Badge variant="secondary" className="text-xs">
                            Session
                          </Badge>
                        )}
                        {measurement.isPreSession && (
                          <Badge variant="outline" className="text-xs">
                            Pre-Session
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(measurement.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Photo */}
                  {photoUrls[measurement.id] && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={photoUrls[measurement.id]}
                        alt={`Progress photo from ${formatDate(measurement.date)}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Measurements */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Ruler className="w-4 h-4" />
                      <span>L: {measurement.length}"</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Ruler className="w-4 h-4 rotate-90" />
                      <span>G: {measurement.girth}"</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {measurement.notes && (
                    <p className="text-sm text-muted-foreground italic">"{measurement.notes}"</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground mb-4">
              {measurements.length === 0
                ? "Start taking progress photos during your sessions to track your journey."
                : "No photos match your current filter criteria."}
            </p>
            {measurements.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

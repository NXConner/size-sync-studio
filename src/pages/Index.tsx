import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MeasurementCard } from "@/components/MeasurementCard";
import { AddMeasurementDialog } from "@/components/AddMeasurementDialog";
import { ProgressChart } from "@/components/ProgressChart";
import { GoalCard } from "@/components/GoalCard";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, 
  Ruler, 
  Target, 
  TrendingUp, 
  Calendar,
  Activity
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

interface Measurement {
  id: string;
  type: string;
  value: number;
  unit: string;
  date: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  type: 'weight_loss' | 'weight_gain' | 'measurement';
}

const Index = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Lose 10kg",
      description: "Target weight loss for summer",
      target: 75,
      current: 82,
      unit: "kg",
      deadline: "2024-06-01",
      type: "weight_loss"
    },
    {
      id: "2", 
      title: "Waist Goal",
      description: "Reduce waist measurement",
      target: 85,
      current: 90,
      unit: "cm",
      deadline: "2024-05-15",
      type: "measurement"
    }
  ]);

  // Load measurements from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sizeSeekerMeasurements');
    if (saved) {
      setMeasurements(JSON.parse(saved));
    }
  }, []);

  // Save measurements to localStorage
  useEffect(() => {
    localStorage.setItem('sizeSeekerMeasurements', JSON.stringify(measurements));
  }, [measurements]);

  const addMeasurement = (newMeasurement: Omit<Measurement, 'id'>) => {
    const measurement: Measurement = {
      ...newMeasurement,
      id: Date.now().toString(),
    };
    setMeasurements(prev => [measurement, ...prev]);
  };

  const getLatestMeasurement = (type: string) => {
    return measurements.find(m => m.type === type);
  };

  const getMeasurementChange = (type: string) => {
    const sorted = measurements
      .filter(m => m.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (sorted.length < 2) return undefined;
    return sorted[0].value - sorted[1].value;
  };

  const getChartData = (type: string) => {
    return measurements
      .filter(m => m.type === type)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => ({
        date: m.date,
        value: m.value
      }));
  };

  const weightData = getLatestMeasurement('weight');
  const waistData = getLatestMeasurement('waist');
  const chestData = getLatestMeasurement('chest');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-black/20" />
        <img 
          src={heroImage}
          alt="Size Seeker Tracker - Body measurement and fitness tracking"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        
        <div className="relative container mx-auto px-4 py-24 text-center text-white">
          <Badge 
            variant="secondary" 
            className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm animate-float"
          >
            <Activity className="w-4 h-4 mr-2" />
            Your Fitness Journey Starts Here
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-float">
            Size Seeker
            <span className="block text-primary-glow">Tracker</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Track your body measurements, set ambitious goals, and visualize your incredible transformation journey
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AddMeasurementDialog onAddMeasurement={addMeasurement} />
            <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
              <Target className="w-5 h-5 mr-2" />
              View Goals
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        
        {/* Quick Stats */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Your Progress at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MeasurementCard
              title="Current Weight"
              value={weightData?.value || 0}
              unit={weightData?.unit || 'kg'}
              change={getMeasurementChange('weight')}
              target={goals.find(g => g.type === 'weight_loss')?.target}
              icon={<Scale className="w-5 h-5" />}
            />
            
            <MeasurementCard
              title="Waist Measurement"
              value={waistData?.value || 0}
              unit={waistData?.unit || 'cm'}
              change={getMeasurementChange('waist')}
              target={goals.find(g => g.title.includes('Waist'))?.target}
              icon={<Ruler className="w-5 h-5" />}
            />
            
            <MeasurementCard
              title="Chest Measurement"
              value={chestData?.value || 0}
              unit={chestData?.unit || 'cm'}
              change={getMeasurementChange('chest')}
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </div>
        </section>

        {/* Charts */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Progress Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressChart
              data={getChartData('weight')}
              title="Weight Progress"
              unit="kg"
              color="hsl(var(--primary))"
            />
            
            <ProgressChart
              data={getChartData('waist')}
              title="Waist Measurements"
              unit="cm"
              color="hsl(var(--accent))"
            />
          </div>
        </section>

        {/* Goals Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Active Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdateGoal={(id) => console.log('Update goal:', id)}
                onCompleteGoal={(id) => console.log('Complete goal:', id)}
              />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="text-center py-12">
          <div className="gradient-card rounded-2xl p-8 shadow-card max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Track Your Next Measurement?</h3>
            <p className="text-muted-foreground mb-6">
              Consistency is key to achieving your fitness goals. Add a new measurement to keep your progress up to date.
            </p>
            <AddMeasurementDialog onAddMeasurement={addMeasurement} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;

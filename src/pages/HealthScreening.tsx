import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Stethoscope,
  Heart,
  Users
} from "lucide-react";
import { peyronieQuestions, stdQuestions } from "@/data/screeningQuestions";
import { ScreeningQuestion, ScreeningResponse, ScreeningResult } from "@/types/screening";
import { 
  generateScreeningResult, 
  saveScreeningResult, 
  getScreeningResults,
  getRecommendations 
} from "@/utils/screeningCalculator";
import { useToast } from "@/hooks/use-toast";

export default function HealthScreening() {
  const [activeTab, setActiveTab] = useState<'overview' | 'peyronie' | 'std' | 'results'>('overview');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<ScreeningResponse[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedScreenings, setCompletedScreenings] = useState<ScreeningResult[]>([]);
  const { toast } = useToast();

  // Load screening results on mount
  useState(() => {
    setCompletedScreenings(getScreeningResults());
  });

  const getCurrentQuestions = (): ScreeningQuestion[] => {
    return activeTab === 'peyronie' ? peyronieQuestions : stdQuestions;
  };

  const handleResponse = (questionId: string, answer: string | number) => {
    const updatedResponses = responses.filter(r => r.questionId !== questionId);
    updatedResponses.push({
      questionId,
      answer,
      timestamp: new Date().toISOString(),
    });
    setResponses(updatedResponses);
  };

  const handleNext = () => {
    const questions = getCurrentQuestions();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeScreening();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const completeScreening = async () => {
    setIsCompleting(true);
    try {
      const category = activeTab as 'peyronie' | 'std';
      const questions = getCurrentQuestions();
      const result = generateScreeningResult(category, questions, responses);
      
      saveScreeningResult(result);
      setCompletedScreenings(getScreeningResults());
      
      toast({
        title: "Screening Completed",
        description: `${category === 'peyronie' ? "Peyronie's disease" : "STD"} screening completed. Check results tab for recommendations.`,
      });

      // Reset for next screening
      setResponses([]);
      setCurrentQuestionIndex(0);
      setActiveTab('results');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete screening. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const startScreening = (type: 'peyronie' | 'std') => {
    setActiveTab(type);
    setCurrentQuestionIndex(0);
    setResponses([]);
  };

  const renderQuestion = (question: ScreeningQuestion) => {
    const currentResponse = responses.find(r => r.questionId === question.id);

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Question {currentQuestionIndex + 1} of {getCurrentQuestions().length}</CardTitle>
            <Badge variant="outline">
              {question.category === 'peyronie' ? "Peyronie's" : "STD"} Screening
            </Badge>
          </div>
          <Progress value={((currentQuestionIndex + 1) / getCurrentQuestions().length) * 100} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">{question.question}</div>
          
          {question.type === 'yes-no' && (
            <RadioGroup
              value={currentResponse?.answer as string || ''}
              onValueChange={(value) => handleResponse(question.id, value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
          )}

          {question.type === 'multiple-choice' && question.options && (
            <RadioGroup
              value={currentResponse?.answer as string || ''}
              onValueChange={(value) => handleResponse(question.id, value)}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'scale' && question.scaleMin && question.scaleMax && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{question.scaleLabels?.min}</span>
                <span>{question.scaleLabels?.max}</span>
              </div>
              <Slider
                value={[currentResponse?.answer as number || question.scaleMin]}
                onValueChange={(value) => handleResponse(question.id, value[0])}
                min={question.scaleMin}
                max={question.scaleMax}
                step={1}
                className="w-full"
              />
              <div className="text-center text-lg font-semibold">
                {currentResponse?.answer || question.scaleMin}
              </div>
            </div>
          )}

          {question.type === 'text' && (
            <Textarea
              placeholder="Please provide details..."
              value={currentResponse?.answer as string || ''}
              onChange={(e) => handleResponse(question.id, e.target.value)}
            />
          )}

          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!currentResponse || isCompleting}
            >
              {currentQuestionIndex === getCurrentQuestions().length - 1 
                ? (isCompleting ? "Completing..." : "Complete Screening")
                : "Next"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'default';
      case 'moderate': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'routine': return <Clock className="w-4 h-4" />;
      case 'soon': return <Activity className="w-4 h-4" />;
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'immediate': return <Shield className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
          Health Screening Center
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive health screening tools for early detection and prevention. 
          Take control of your health with evidence-based assessments.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="peyronie">Peyronie's</TabsTrigger>
          <TabsTrigger value="std">STD Screening</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Peyronie's Disease Screening
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Early detection screening for Peyronie's disease, focusing on curvature, 
                  plaques, and related symptoms.
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{peyronieQuestions.length} Questions</Badge>
                  <span className="text-sm text-muted-foreground">~5 minutes</span>
                </div>
                <Button 
                  onClick={() => startScreening('peyronie')} 
                  className="w-full"
                >
                  Start Peyronie's Screening
                </Button>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  STD/STI Screening
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Comprehensive sexual health screening to assess STD/STI risk factors 
                  and symptoms.
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{stdQuestions.length} Questions</Badge>
                  <span className="text-sm text-muted-foreground">~7 minutes</span>
                </div>
                <Button 
                  onClick={() => startScreening('std')} 
                  className="w-full"
                >
                  Start STD Screening
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Stethoscope className="h-4 w-4" />
            <AlertDescription>
              <strong>Medical Disclaimer:</strong> These screenings are educational tools and do not replace 
              professional medical diagnosis. Always consult with healthcare providers for symptoms or concerns.
            </AlertDescription>
          </Alert>

          {completedScreenings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Screening History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{completedScreenings.length}</div>
                    <div className="text-sm text-muted-foreground">Total Screenings</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-500">
                      {completedScreenings.filter(s => s.riskLevel === 'low').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Low Risk Results</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-500">
                      {completedScreenings.filter(s => s.followUpRequired).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Requiring Follow-up</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="peyronie" className="mt-6">
          {renderQuestion(peyronieQuestions[currentQuestionIndex])}
        </TabsContent>

        <TabsContent value="std" className="mt-6">
          {renderQuestion(stdQuestions[currentQuestionIndex])}
        </TabsContent>

        <TabsContent value="results" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Screening Results</h2>
            <Badge variant="outline">{completedScreenings.length} Total Results</Badge>
          </div>

          {completedScreenings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No screening results yet. Complete a screening to see results here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedScreenings.map((result) => {
                // Skip general category for now since it's not fully implemented
                if (result.category === 'general') return null;
                
                const recommendation = getRecommendations(result.category as 'peyronie' | 'std', result.riskLevel);
                return (
                  <Card key={result.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="capitalize">
                            {result.category === 'peyronie' ? "Peyronie's Disease" : "STD/STI"} Screening
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(result.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getRiskBadgeVariant(result.riskLevel)}>
                            {result.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            Score: {result.riskScore}/100
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={result.riskScore} className="h-2" />
                      
                      {recommendation && (
                        <Alert className={result.riskLevel === 'low' ? '' : 'border-orange-200'}>
                          <div className="flex items-center gap-2">
                            {getUrgencyIcon(recommendation.urgency)}
                            <AlertDescription>
                              <strong>{recommendation.title}</strong>
                              <br />
                              {recommendation.description}
                            </AlertDescription>
                          </div>
                        </Alert>
                      )}

                      {result.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {result.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.followUpRequired && (
                        <Alert>
                          <Users className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Medical consultation recommended.</strong> Consider scheduling an appointment with a healthcare provider.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Upload, Compass, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const VastuAI = () => {
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalysis(true);
      toast({
        title: "Vastu Analysis Complete!",
        description: "Your design has been analyzed for Vastu compliance.",
      });
    }, 2000);
  };

  const vastuScore = 82;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Vastu AI Dashboard</h1>
            <p className="text-muted-foreground text-lg">Get intelligent Vastu analysis and recommendations</p>
          </div>

          {!hasAnalysis ? (
            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl border-2 border-dashed border-purple-light/50 p-16 text-center bg-gradient-card">
                <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6 shadow-card">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Upload Your Floor Plan</h3>
                <p className="text-muted-foreground mb-6">Get comprehensive Vastu analysis and scoring</p>
                <Button 
                  onClick={handleAnalyze}
                  size="lg"
                  className="bg-gradient-purple text-white hover:shadow-purple transition-smooth"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing..." : "Start Vastu Analysis"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Vastu Score */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-border shadow-card bg-card p-8 text-center sticky top-24">
                  <h3 className="text-lg font-bold mb-6 text-foreground">Vastu Score</h3>
                  
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-secondary"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - vastuScore / 100)}`}
                        className="text-primary transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <div className="text-5xl font-bold text-primary">{vastuScore}</div>
                        <div className="text-sm text-muted-foreground">out of 100</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Compass className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground">Good Alignment</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Your design follows most Vastu principles</p>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Strengths */}
                <div className="rounded-2xl border border-border shadow-card bg-card p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Vastu Strengths
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Main entrance faces East - Excellent for positive energy flow",
                      "Kitchen positioned in South-East - Ideal fire element placement",
                      "Master bedroom in South-West - Promotes stability and rest",
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-900">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weaknesses */}
                <div className="rounded-2xl border border-border shadow-card bg-card p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Bathroom in North-East corner - Consider relocating or using remedies",
                      "Study room lacks North-East light - Add more windows for better energy",
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-900">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="rounded-2xl border border-border shadow-card bg-card p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Smart Recommendations
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Place a water feature in North-East to enhance positive energy",
                      "Use mirrors strategically to reflect light in darker areas",
                      "Consider adding plants in the East direction for prosperity",
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-xl bg-secondary/50 border border-purple-light/30">
                        <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Directional Compass */}
                <div className="rounded-2xl border border-border shadow-card bg-gradient-card p-8">
                  <h3 className="text-lg font-bold mb-6 text-center text-foreground">Directional Analysis</h3>
                  <div className="relative w-64 h-64 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-light/30" />
                    <div className="absolute inset-4 rounded-full border-2 border-purple-medium/20" />
                    
                    {/* Directions */}
                    {[
                      { dir: "N", top: "0", left: "50%", transform: "-translate-x-1/2" },
                      { dir: "E", top: "50%", right: "0", transform: "-translate-y-1/2" },
                      { dir: "S", bottom: "0", left: "50%", transform: "-translate-x-1/2" },
                      { dir: "W", top: "50%", left: "0", transform: "-translate-y-1/2" },
                    ].map(({ dir, ...pos }) => (
                      <div
                        key={dir}
                        className="absolute w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-purple"
                        style={{ ...pos, transform: pos.transform }}
                      >
                        {dir}
                      </div>
                    ))}
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Compass className="w-16 h-16 text-primary animate-glow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VastuAI;

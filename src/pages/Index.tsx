import Navbar from "@/components/Navbar";
import FeatureCard from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Box, Compass, Layout, Upload, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 blueprint-pattern opacity-10" />
        
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-glow/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-light/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        
        {/* Content */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-slide-up">
              <Sparkles className="w-4 h-4 text-purple-glow" />
              <span className="text-sm text-white/90">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-slide-up leading-tight" style={{ animationDelay: "0.1s" }}>
              Let Vastu direct your 2D design into a 3D model
            </h1>
            
            <p className="text-xl text-white/80 mb-10 max-w-2xl animate-slide-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
              AI-powered 2D to 3D conversion and Vastu-compliant design intelligence for architects, designers, and homeowners.
            </p>
            
            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button 
                onClick={() => navigate("/converter")}
                size="lg"
                className="px-8 py-6 text-lg rounded-full bg-white text-primary hover:shadow-glow transition-smooth"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                onClick={() => navigate("/vastu")}
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg rounded-full border-white/30 text-white hover:bg-white/10 transition-smooth"
              >
                Explore Vastu AI
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                About VISHWAKARMA AI
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                VISHWAKARMA AI bridges the gap between architectural blueprints and immersive 3D visualization. Designed for architects, designers, builders, and homeowners — our AI converts 2D plans into interactive 3D models while ensuring Vastu alignment.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Experience the future of architectural design where ancient wisdom meets cutting-edge technology.
              </p>
            </div>
            
            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-2xl overflow-hidden shadow-purple border border-purple-light/20">
                <div className="aspect-video bg-gradient-card flex items-center justify-center">
                  <div className="text-center p-8">
                    <Box className="w-24 h-24 mx-auto mb-4 text-primary animate-float" />
                    <p className="text-muted-foreground">Blueprint → 3D Wireframe Visualization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Core Features</h2>
            <p className="text-xl text-muted-foreground">Powerful AI tools for modern architecture</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Zap}
              title="AI 2D → 3D Conversion"
              description="Transform your 2D floor plans into detailed 3D models with our advanced AI engine in seconds."
            />
            <FeatureCard
              icon={Compass}
              title="Vastu AI Analysis"
              description="Get comprehensive Vastu compliance scores and intelligent placement recommendations."
            />
            <FeatureCard
              icon={Layout}
              title="Smart Layouts"
              description="AI-powered suggestions for optimal room placement and architectural flow."
            />
            <FeatureCard
              icon={Box}
              title="Editable 3D Models"
              description="Fully interactive and customizable 3D visualizations with real-time rendering."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4 text-foreground">How It Works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to transform your designs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { step: "01", icon: Upload, title: "Upload Your 2D Plan", desc: "Simply drag and drop your architectural blueprint or floor plan." },
              { step: "02", icon: Sparkles, title: "AI Analyzes + Generates", desc: "Our AI processes your design and creates a detailed 3D model." },
              { step: "03", icon: Box, title: "Explore Your 3D Model", desc: "View, customize, and export your 3D visualization or Vastu report." },
            ].map((item, i) => (
              <div key={i} className="text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-20 h-20 rounded-2xl bg-gradient-purple shadow-purple flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-primary/20 mb-2">{item.step}</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary/30 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            © 2024 VISHWAKARMA AI. Transforming architecture with intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

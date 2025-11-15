import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Upload, Settings, Download, RotateCw, Maximize, Sun } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Converter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsProcessing(true);
      
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        toast({
          title: "3D Model Generated!",
          description: "Your 2D plan has been converted successfully.",
        });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">2D → 3D Converter</h1>
            <p className="text-muted-foreground text-lg">Transform your architectural plans into interactive 3D models</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-2 space-y-6">
              {!file ? (
                <div className="relative">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-purple-light/50 rounded-2xl p-16 text-center hover:border-purple-medium transition-smooth hover:shadow-purple bg-gradient-card">
                      <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6 shadow-card">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">Upload Your 2D Plan</h3>
                      <p className="text-muted-foreground mb-4">Drag and drop or click to browse</p>
                      <p className="text-sm text-muted-foreground">Supports JPG, PNG, PDF up to 10MB</p>
                    </div>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-border shadow-card bg-card overflow-hidden">
                  {isProcessing ? (
                    <div className="aspect-video flex flex-col items-center justify-center bg-gradient-card">
                      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                      <p className="text-lg font-medium text-foreground">AI Processing Your Design...</p>
                      <p className="text-sm text-muted-foreground mt-2">Generating 3D model</p>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-card flex items-center justify-center blueprint-pattern">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-6 relative">
                          <div className="absolute inset-0 bg-purple-medium/20 rounded-2xl animate-pulse" />
                          <div className="absolute inset-4 bg-purple-light/30 rounded-xl animate-pulse" style={{ animationDelay: "0.5s" }} />
                          <div className="absolute inset-8 bg-purple-glow/40 rounded-lg animate-pulse" style={{ animationDelay: "1s" }} />
                        </div>
                        <p className="text-xl font-bold text-foreground mb-2">3D Model Ready</p>
                        <p className="text-muted-foreground">Interactive view generated successfully</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls Sidebar */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border shadow-card bg-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                  <Settings className="w-5 h-5 text-primary" />
                  Controls
                </h3>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" disabled={!file}>
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate Camera
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled={!file}>
                    <Sun className="w-4 h-4 mr-2" />
                    Adjust Lighting
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled={!file}>
                    <Maximize className="w-4 h-4 mr-2" />
                    Dimensions
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border shadow-card bg-card p-6">
                <h3 className="text-lg font-bold mb-4 text-foreground">Export Options</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-purple text-white hover:shadow-purple transition-smooth" 
                    disabled={!file || isProcessing}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download 3D Model
                  </Button>
                  <Button variant="outline" className="w-full" disabled={!file || isProcessing}>
                    Export as PNG
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Converter;

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import PhotoUpload from "@/components/PhotoUpload";
import AnalysisResults from "@/components/AnalysisResults";
import logo from "@/assets/logo.png";

interface AnalysisData {
  settings: { name: string; value: string; description: string }[];
  colorGrading?: {
    highlights: { hue: string; intensity: string };
    midtones: { hue: string; intensity: string };
    shadows: { hue: string; intensity: string };
  };
  style?: string;
  mood?: string;
}

const Index = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);

  const handleImageSelected = async (base64: string, previewUrl: string) => {
    setPreview(previewUrl);
    setResult(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64: base64 }),
        }
      );

      if (response.status === 429) {
        toast.error("Rate limit reached. Please wait a moment and try again.");
        return;
      }
      if (response.status === 402) {
        toast.error("AI credits exhausted. Please add credits to continue.");
        return;
      }
      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setResult(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to analyze the photo. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <img src={logo} alt="EditDecode logo" className="w-10 h-10 rounded-xl" />
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Edit<span className="text-gradient">Decode</span>
            </h1>
            <p className="text-xs text-muted-foreground">Reverse-engineer photo edits with AI</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Upload / Preview */}
          <div className="space-y-4">
            {!preview ? (
              <PhotoUpload onImageSelected={handleImageSelected} isAnalyzing={isAnalyzing} />
            ) : (
              <div className="space-y-4">
                <div className="pastel-card rounded-2xl overflow-hidden">
                  <img
                    src={preview}
                    alt="Uploaded photo"
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                </div>
                <button
                  onClick={resetUpload}
                  disabled={isAnalyzing}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                >
                  ← Upload a different photo
                </button>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div>
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center min-h-[280px] pastel-card rounded-2xl">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-foreground font-medium">Analyzing your photo…</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Detecting edits, color grading & style
                </p>
              </div>
            )}

            {!isAnalyzing && !result && !preview && (
              <div className="flex flex-col items-center justify-center min-h-[280px] pastel-card rounded-2xl text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-lavender/50 flex items-center justify-center mb-4">
                  <img src={logo} alt="" className="w-10 h-10" />
                </div>
                <p className="text-muted-foreground">
                  Upload an edited photo and we'll detect the settings used — exposure, color
                  grading, contrast and more.
                </p>
              </div>
            )}

            {!isAnalyzing && !result && preview && (
              <div className="flex flex-col items-center justify-center min-h-[280px] pastel-card rounded-2xl text-center p-8">
                <p className="text-muted-foreground">Something went wrong. Try uploading again.</p>
              </div>
            )}

            {result && (
              <AnalysisResults
                settings={result.settings}
                colorGrading={result.colorGrading}
                style={result.style}
                mood={result.mood}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

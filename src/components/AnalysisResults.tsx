import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Setting {
  name: string;
  value: string;
  description: string;
}

interface ColorGrading {
  highlights: { hue: string; intensity: string };
  midtones: { hue: string; intensity: string };
  shadows: { hue: string; intensity: string };
}

interface AnalysisResultsProps {
  settings: Setting[];
  colorGrading?: ColorGrading;
  style?: string;
  mood?: string;
}

const AnalysisResults = ({ settings, colorGrading, style, mood }: AnalysisResultsProps) => {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    const lines = settings.map((s) => `${s.name}: ${s.value}`);
    if (colorGrading) {
      lines.push("");
      lines.push("--- Color Grading ---");
      lines.push(`Highlights: ${colorGrading.highlights.hue} (${colorGrading.highlights.intensity})`);
      lines.push(`Midtones: ${colorGrading.midtones.hue} (${colorGrading.midtones.intensity})`);
      lines.push(`Shadows: ${colorGrading.shadows.hue} (${colorGrading.shadows.intensity})`);
    }
    if (style) lines.push(`\nStyle: ${style}`);
    if (mood) lines.push(`Mood: ${mood}`);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    toast.success("Settings copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Detected Settings</h2>
        <button
          onClick={copyAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy All"}
        </button>
      </div>

      {/* Style & Mood */}
      {(style || mood) && (
        <div className="glass-card rounded-lg p-4 space-y-2">
          {style && (
            <p className="text-sm">
              <span className="text-primary font-medium">Style:</span>{" "}
              <span className="text-foreground">{style}</span>
            </p>
          )}
          {mood && (
            <p className="text-sm">
              <span className="text-primary font-medium">Mood:</span>{" "}
              <span className="text-foreground">{mood}</span>
            </p>
          )}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {settings.map((setting) => (
          <div
            key={setting.name}
            className="glass-card rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-muted-foreground">{setting.name}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{setting.description}</p>
            </div>
            <span className="font-mono text-primary font-semibold text-sm whitespace-nowrap ml-4">
              {setting.value}
            </span>
          </div>
        ))}
      </div>

      {/* Color Grading */}
      {colorGrading && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Color Grading</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["highlights", "midtones", "shadows"] as const).map((zone) => (
              <div key={zone} className="glass-card rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  {zone}
                </p>
                <p className="text-foreground font-medium text-sm">{colorGrading[zone].hue}</p>
                <p className="text-xs text-muted-foreground mt-1">{colorGrading[zone].intensity}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;

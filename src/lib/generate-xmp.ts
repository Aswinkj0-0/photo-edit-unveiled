interface Setting {
  name: string;
  value: string;
}

interface ColorGrading {
  highlights: { hue: string; intensity: string };
  midtones: { hue: string; intensity: string };
  shadows: { hue: string; intensity: string };
}

// Map setting names to Adobe Camera Raw XMP property names
const settingToXmp: Record<string, string> = {
  Exposure: "crs:Exposure2012",
  Contrast: "crs:Contrast2012",
  Highlights: "crs:Highlights2012",
  Shadows: "crs:Shadows2012",
  Whites: "crs:Whites2012",
  Blacks: "crs:Blacks2012",
  Saturation: "crs:Saturation",
  Vibrance: "crs:Vibrance",
  Temperature: "crs:Temperature",
  Tint: "crs:Tint",
  Clarity: "crs:Clarity2012",
  Dehaze: "crs:Dehaze",
  Sharpness: "crs:Sharpness",
  "Noise Reduction": "crs:LuminanceSmoothing",
  Vignette: "crs:PostCropVignetteAmount",
  Grain: "crs:GrainAmount",
};

function parseNumericValue(value: string): string {
  const match = value.match(/([+-]?\d+\.?\d*)/);
  return match ? match[1] : "0";
}

function hueToSplitToneHue(hue: string): number {
  const h = hue.toLowerCase();
  if (h.includes("orange") || h.includes("warm")) return 40;
  if (h.includes("yellow")) return 60;
  if (h.includes("gold")) return 50;
  if (h.includes("red")) return 10;
  if (h.includes("magenta") || h.includes("pink")) return 320;
  if (h.includes("purple")) return 280;
  if (h.includes("blue")) return 220;
  if (h.includes("teal") || h.includes("cyan")) return 190;
  if (h.includes("green")) return 140;
  return 0;
}

function intensityToSat(intensity: string): number {
  const i = intensity.toLowerCase();
  if (i.includes("high") || i.includes("strong")) return 70;
  if (i.includes("medium") || i.includes("moderate")) return 40;
  if (i.includes("low") || i.includes("subtle") || i.includes("slight")) return 20;
  if (i.includes("none") || i.includes("neutral")) return 0;
  return 30;
}

export function generateXmp(
  settings: Setting[],
  colorGrading?: ColorGrading,
  style?: string
): string {
  const xmpSettings = settings
    .filter((s) => settingToXmp[s.name])
    .map((s) => `         ${settingToXmp[s.name]}="${parseNumericValue(s.value)}"`)
    .join("\n");

  let splitTone = "";
  if (colorGrading) {
    const hH = hueToSplitToneHue(colorGrading.highlights.hue);
    const sH = intensityToSat(colorGrading.highlights.intensity);
    const hS = hueToSplitToneHue(colorGrading.shadows.hue);
    const sS = intensityToSat(colorGrading.shadows.intensity);
    splitTone = `
         crs:SplitToningShadowHue="${hS}"
         crs:SplitToningShadowSaturation="${sS}"
         crs:SplitToningHighlightHue="${hH}"
         crs:SplitToningHighlightSaturation="${sH}"
         crs:SplitToningBalance="0"`;
  }

  const label = style ? style.slice(0, 60) : "EditDecode Preset";

  return `<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="EditDecode">
   <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about=""
         xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
         crs:PresetType="Normal"
         crs:Version="15.0"
         crs:ProcessVersion="6.7"
${xmpSettings}${splitTone}>
         <crs:Name>
            <rdf:Alt>
               <rdf:li xml:lang="x-default">${label}</rdf:li>
            </rdf:Alt>
         </crs:Name>
      </rdf:Description>
   </rdf:RDF>
</x:xmpmeta>`;
}

export function downloadXmp(
  settings: Setting[],
  colorGrading?: ColorGrading,
  style?: string
) {
  const xml = generateXmp(settings, colorGrading, style);
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "EditDecode_Preset.xmp";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  Droplets,
  HelpCircle,
  Lightbulb,
  Moon,
  Snowflake,
  Sun,
  Wind,
} from "lucide-react";

// Each matcher is tried in order against a lowercased label; first match wins.
// Backend labels are free-text (see backend/app/services/reference_data.py),
// so this matches by keyword rather than exact code.

const WEATHER_MATCHERS = [
  [/snow/, CloudSnow],
  [/fog|mist/, CloudFog],
  [/rain/, CloudRain],
  [/wind/, Wind],
  [/fine/, Sun],
];

export function weatherIcon(label = "") {
  const lower = label.toLowerCase();
  for (const [pattern, Icon] of WEATHER_MATCHERS) {
    if (pattern.test(lower)) return Icon;
  }
  return HelpCircle;
}

const SURFACE_MATCHERS = [
  [/frost|ice/, Snowflake],
  [/snow/, CloudSnow],
  [/wet|damp|flood/, Droplets],
  [/dry/, Sun],
];

export function surfaceIcon(label = "") {
  const lower = label.toLowerCase();
  for (const [pattern, Icon] of SURFACE_MATCHERS) {
    if (pattern.test(lower)) return Icon;
  }
  return HelpCircle;
}

const LIGHT_MATCHERS = [
  [/daylight/, Sun],
  [/darkness/, Moon],
];

export function lightIcon(label = "") {
  const lower = label.toLowerCase();
  for (const [pattern, Icon] of LIGHT_MATCHERS) {
    if (pattern.test(lower)) return Icon;
  }
  return Lightbulb;
}

export function severityIcon(label = "") {
  if (label === "Fatal") return AlertOctagon;
  if (label === "Serious") return AlertTriangle;
  return CheckCircle2;
}

export function conditionIconFor(dimension, label) {
  if (dimension === "weather") return weatherIcon(label);
  if (dimension === "road_surface") return surfaceIcon(label);
  if (dimension === "light") return lightIcon(label);
  return null;
}

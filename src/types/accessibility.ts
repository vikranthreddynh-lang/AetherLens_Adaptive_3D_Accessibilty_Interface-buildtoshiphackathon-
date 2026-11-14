export type FeatureId =
  | 'what-if-pathways'
  | 'live-sign-captions'
  | 'vernacular-bridge';

export type EvidenceState =
  | 'source-supported'
  | 'information-not-specified'
  | 'source-ambiguous';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'bn';

export interface AccessibilityPreferences {
  calmMode: boolean;
  simplifyView: boolean;
  fontScale: number;
  highContrast: boolean;
  reducedDistraction: boolean;
}

export interface DemoScenarioState {
  barrier: string;
  evidenceState: EvidenceState;
  language: LanguageCode;
  clarificationQuestion: string;
}

export interface HUDProps {
  activeFeature: FeatureId | null;
  onFeatureSelect: (feature: FeatureId | null) => void;
  onVoiceTrigger: () => void;
  onSimplifyTrigger: () => void;
}

export interface FeatureDrawerProps {
  feature: FeatureId;
  onClose: () => void;
  onVoiceTrigger: () => void;
  onSimplifyTrigger: () => void;
}

export interface FeatureMetadata {
  id: FeatureId;
  title: string;
  subtitle: string;
  description: string;
  position: [number, number, number];
  badge: string;
}

export interface BarrierOption {
  id: string;
  label: string;
  description: string;
}

export interface EvidenceOption {
  state: EvidenceState;
  title: string;
  description: string;
  tag: string;
}

export interface PathwayResult {
  headline: string;
  statusLabel: string;
  body: string;
  sourceQuote: string;
  suggestedAction: string;
  defaultQuestion: string;
}

import { z } from 'zod';

export const AccessibilityOutputsSchema = z.object({
  audio: z.boolean().default(true),
  haptics: z.boolean().default(false),
  accessibleText: z.boolean().default(true),
  brailleCompatible: z.boolean().default(true),
  visualTimeline: z.boolean().default(false),
  spatialAudio: z.boolean().default(false),
});

export const DetailLevelSchema = z.enum(['low', 'balanced', 'high']).default('balanced');
export const HapticVocabularySchema = z.enum(['minimal', 'standard', 'expressive']).default('standard');

export const AccessibilityPreferencesSchema = z.object({
  outputs: AccessibilityOutputsSchema.default({
    audio: true,
    haptics: false,
    accessibleText: true,
    brailleCompatible: true,
    visualTimeline: false,
    spatialAudio: false,
  }),
  detailLevel: DetailLevelSchema,
  quietMode: z.boolean().default(false),
  speechRate: z.number().min(0.5).max(2.5).default(1.0),
  hapticVocabulary: HapticVocabularySchema,
  customHapticMap: z.record(z.string()).optional(),
});

export const ProfileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(100).optional(),
  preferredLanguage: z.string().trim().min(2).max(35).optional().default('en'),
  accessibilityPreferences: AccessibilityPreferencesSchema.optional(),
});

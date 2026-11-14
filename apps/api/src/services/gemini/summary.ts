import {
  EnvironmentalEvent,
  EnvironmentType,
  SessionSummary,
  SessionSummarySchema,
} from '@senseweave/shared';
import { getGeminiClient } from './client.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface GenerateSummaryOptions {
  events: EnvironmentalEvent[];
  environmentType: EnvironmentType;
  observationGaps: Array<{ startedAt: string; endedAt: string; reason: string }>;
  language?: string;
}

export async function generateSessionSummary(
  options: GenerateSummaryOptions
): Promise<SessionSummary> {
  const { events, environmentType, observationGaps } = options;

  // Fallback / deterministic summary builder
  const fallbackSummary = buildDeterministicSummary(events, environmentType, observationGaps);

  if (events.length === 0) {
    return fallbackSummary;
  }

  try {
    const ai = getGeminiClient();

    const prompt = `You are SenseWeave. Generate a grounded, privacy-conscious session summary for an environmental awareness session.
Environment profile: ${environmentType}.
Total events observed: ${events.length}.

Event History Chronology:
${JSON.stringify(
  events.map((e) => ({
    id: e.id,
    type: e.eventType,
    desc: e.description,
    modality: e.sourceModalities,
    pos: e.relativePosition,
    cert: e.certainty,
    time: e.observedAt,
  })),
  null,
  2
)}

Observation gaps / interruptions:
${JSON.stringify(observationGaps, null, 2)}

Requirements:
- Never invent dialogue or identify people.
- Describe observable group activity and conversational turn patterns.
- Note any uncertainties and observation gaps.
- Return strictly JSON matching:
{
  "title": string,
  "overview": string,
  "eventTimelineSummary": [{ "description": string, "sourceEventIds": [string], "certainty": "clear"|"uncertain"|"insufficient" }],
  "conversationActivity": [string],
  "visualObservations": [string],
  "environmentalSounds": [string],
  "uncertainties": [string],
  "observationGaps": [string]
}`;

    const candidateModels = [
      env.GEMINI_SUMMARY_MODEL,
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.5-flash',
    ];

    let summaryText = '';
    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        summaryText = response.text || '';
        if (summaryText) break;
      } catch (err) {
        logger.warn(`Summary generation failed on model ${model}, trying next`, {
          error: (err as Error).message,
        });
      }
    }

    if (summaryText) {
      const parsed = JSON.parse(summaryText);
      const validated = SessionSummarySchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      } else {
        logger.warn('AI summary schema validation failed, using grounded fallback', {
          issues: validated.error.issues,
        });
      }
    }
  } catch (err) {
    logger.error('Error generating AI session summary, falling back to deterministic recap', {
      error: (err as Error).message,
    });
  }

  return fallbackSummary;
}

function buildDeterministicSummary(
  events: EnvironmentalEvent[],
  environmentType: EnvironmentType,
  observationGaps: Array<{ startedAt: string; endedAt: string; reason: string }>
): SessionSummary {
  const title = `SenseWeave Session: ${environmentType.replace(/_/g, ' ').toUpperCase()}`;

  const conversationEvents = events.filter((e) =>
    ['speech_activity', 'speaker_turn', 'overlapping_speech'].includes(e.eventType)
  );
  const visualEvents = events.filter((e) =>
    ['raised_hand', 'pointing_gesture', 'attention_shift', 'display_change', 'object_movement'].includes(
      e.eventType
    )
  );
  const soundEvents = events.filter((e) =>
    ['public_announcement', 'applause', 'environment_sound', 'door_activity'].includes(e.eventType)
  );

  const overview = events.length === 0
    ? `No significant environmental signals were detected during this ${environmentType.replace(/_/g, ' ')} session.`
    : `Recorded ${events.length} observable environmental events during this ${environmentType.replace(/_/g, ' ')} session, including ${conversationEvents.length} conversation dynamics, ${visualEvents.length} visible physical gestures, and ${soundEvents.length} distinct sound events.`;

  const eventTimelineSummary = events.slice(0, 30).map((e) => ({
    description: e.description,
    sourceEventIds: [e.id],
    certainty: e.certainty,
  }));

  const conversationActivity = conversationEvents.slice(0, 10).map((e) => e.description);
  const visualObservations = visualEvents.slice(0, 10).map((e) => e.description);
  const environmentalSounds = soundEvents.slice(0, 10).map((e) => e.description);

  const uncertainties = events
    .filter((e) => e.certainty !== 'clear')
    .slice(0, 10)
    .map((e) => `${e.description} (${e.certainty} evidence)`);

  const gaps = observationGaps.map((g) => `${g.reason} at ${new Date(g.startedAt).toLocaleTimeString()}`);

  return {
    title,
    overview,
    eventTimelineSummary: eventTimelineSummary.length > 0 ? eventTimelineSummary : [
      {
        description: 'Session commenced with baseline observation monitoring.',
        sourceEventIds: [],
        certainty: 'clear',
      },
    ],
    conversationActivity,
    visualObservations,
    environmentalSounds,
    uncertainties,
    observationGaps: gaps,
  };
}

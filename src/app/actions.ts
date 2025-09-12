'use server';

import { generateMotivation, type GenerateMotivationInput, type GenerateMotivationOutput } from '@/ai/flows/ai-powered-motivation';

export async function getMotivationAction(input: GenerateMotivationInput): Promise<GenerateMotivationOutput> {
  try {
    const output = await generateMotivation(input);
    return output;
  } catch (error) {
    console.error('Error getting motivation:', error);
    return {
      message: 'I seem to be at a loss for words right now. Please try again in a moment.',
      suggestion: 'Maybe take a short break and come back with a fresh perspective.',
    };
  }
}

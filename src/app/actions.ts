'use server';
import { generateMotivation, type GenerateMotivationInput, type GenerateMotivationOutput } from '@/ai/flows/ai-powered-motivation';

export async function getMotivationAction(input: GenerateMotivationInput): Promise<GenerateMotivationOutput> {
  try {
    const output = await generateMotivation(input);
    return output;
  } catch (error) {
    console.error('Error getting motivation:', error);
    return {
      message: "Keep pushing forward, you're on the right track!",
    };
  }
}

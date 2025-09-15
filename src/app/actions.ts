'use server';
import { generateMotivation, type GenerateMotivationInput, type GenerateMotivationOutput } from '@/ai/flows/ai-powered-motivation';

export async function getMotivationAction(input: GenerateMotivationInput): Promise<GenerateMotivationOutput> {
  try {
    const output = await generateMotivation(input);
    return output;
  } catch (error) {
    console.error('Error getting motivation:', error);
    // Return a default message in the expected format to ensure the client receives a valid response.
    return {
      message: "Keep pushing forward, you're on the right track!",
    };
  }
}

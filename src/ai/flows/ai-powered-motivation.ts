'use server';

/**
 * @fileOverview Provides personalized, encouraging messages and suggestions from an AI tool to help users stay motivated and get back on track with their goals.
 *
 * - generateMotivation - A function that generates a personalized motivation message.
 * - GenerateMotivationInput - The input type for the generateMotivation function.
 * - GenerateMotivationOutput - The return type for the generateMotivation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMotivationInputSchema = z.object({
  goal: z.string().describe('The specific goal the user is working towards.'),
  progress: z.number().describe('The current progress of the user towards the goal (0-100).'),
  feelings: z.string().describe('The user\'s current feelings or struggles related to the goal.'),
});
export type GenerateMotivationInput = z.infer<typeof GenerateMotivationInputSchema>;

const GenerateMotivationOutputSchema = z.object({
  message: z.string().describe('A personalized, encouraging message to motivate the user.'),
  suggestion: z.string().describe('A suggestion to help the user get back on track.'),
});
export type GenerateMotivationOutput = z.infer<typeof GenerateMotivationOutputSchema>;

export async function generateMotivation(input: GenerateMotivationInput): Promise<GenerateMotivationOutput> {
  return generateMotivationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMotivationPrompt',
  input: {schema: GenerateMotivationInputSchema},
  output: {schema: GenerateMotivationOutputSchema},
  prompt: `You are a motivational AI assistant designed to encourage users to achieve their goals.

  Based on the user's goal, their current progress, and their feelings, provide a personalized and encouraging message, along with a concrete suggestion to help them get back on track.

  Goal: {{{goal}}}
  Progress: {{{progress}}}%
  Feelings: {{{feelings}}}

  Message:`,
});

const generateMotivationFlow = ai.defineFlow(
  {
    name: 'generateMotivationFlow',
    inputSchema: GenerateMotivationInputSchema,
    outputSchema: GenerateMotivationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

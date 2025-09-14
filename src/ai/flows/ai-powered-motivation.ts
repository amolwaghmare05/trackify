'use server';

/**
 * @fileOverview Provides personalized, encouraging messages and suggestions from an AI coach to help users stay motivated.
 *
 * - generateMotivation - A function that generates a personalized motivation message.
 * - GenerateMotivationInput - The input type for the generateMotivation function.
 * - GenerateMotivationOutput - The return type for the generateMotivation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMotivationInputSchema = z.object({
  userName: z.string().describe("The user's display name."),
  goal: z.string().optional().describe('The specific goal the user is working towards. Can be empty if no goal is set.'),
  progressPercentage: z.number().describe("The user's current progress towards the goal (0-100)."),
  consistencyScore: z.number().describe("A score representing the user's task completion consistency (0-100)."),
});
export type GenerateMotivationInput = z.infer<typeof GenerateMotivationInputSchema>;

const GenerateMotivationOutputSchema = z.object({
  message: z.string().describe('A short, personalized, encouraging message for the user.'),
});
export type GenerateMotivationOutput = z.infer<typeof GenerateMotivationOutputSchema>;

export async function generateMotivation(input: GenerateMotivationInput): Promise<GenerateMotivationOutput> {
  return generateMotivationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMotivationPrompt',
  input: {schema: GenerateMotivationInputSchema},
  output: {schema: GenerateMotivationOutputSchema},
  prompt: `You are an encouraging and insightful AI coach named Triumph Track. Your goal is to provide a short, personalized motivational message to a user based on their current progress and consistency. Address the user by their name.

Here is the user's data:
- User Name: {{{userName}}}
{{#if goal}}- Current Goal: {{{goal}}}{{/if}}
- Goal Progress: {{{progressPercentage}}}%
- Task Consistency Score: {{{consistencyScore}}}%

Analyze the data and provide a message based on the following rules:
1. If the user has no goal set (goal is empty or not provided), provide a general, welcoming motivational message encouraging them to set a goal to start their journey.
2. If progress and consistency are both high (>= 75%), praise their dedication and excellent work.
3. If consistency is high (>= 75%) but progress is low (< 50%), acknowledge their consistent effort and encourage them that this hard work is building a strong foundation that will lead to great results.
4. If consistency is low (< 50%), provide a gentle, encouraging nudge to get back on track. Remind them that every small step counts and today is a new opportunity.
5. In all other cases, provide a positive and forward-looking message acknowledging their current status and motivating them to keep going.

Keep the message concise (1-2 sentences).
`,
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

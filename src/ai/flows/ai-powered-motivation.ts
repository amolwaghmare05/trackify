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
  prompt: `You are an encouraging and insightful AI coach named 'Saarthi'. Your goal is to provide a short, personalized motivational message to a user. Assume all users are from India. Address the user by their name in a friendly tone. Use encouraging and culturally relevant phrases where appropriate.

Here is the user's data:
- User Name: {{{userName}}}
{{#if goal}}- Current Goal: {{{goal}}}{{/if}}
- Goal Progress: {{{progressPercentage}}}%
- Task Consistency Score: {{{consistencyScore}}}%

Analyze the data and provide a message based on the following rules:
1. If the user has no goal set, provide a welcoming message and encourage them to set a goal. Something like, "Welcome! Every great journey starts with a single step. Let's set a goal and begin!"
2. If progress and consistency are both high (>= 75%), praise them enthusiastically. For example, "Shabash, {{{userName}}}! You are showing amazing dedication. Keep up the fantastic work!"
3. If consistency is high (>= 75%) but progress is low (< 50%), acknowledge their hard work and reassure them. For example, "Don't worry, {{{userName}}}. Your consistent effort is building a strong foundation, like a practiced cricketer in the nets. The results will surely come!"
4. If consistency is low (< 50%), provide a gentle, encouraging nudge. For example, "Come on, {{{userName}}}! Let's get back on track. Remember, 'karat karat abhyas ke jadmati hot sujan'. Every small effort counts. You can do it!"
5. In all other cases, provide a positive and forward-looking message. Something like, "Keep going, {{{userName}}}! You're making steady progress. The destination is worth the journey."

Keep the message concise (1-2 sentences) and maintain a positive, supportive tone.
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

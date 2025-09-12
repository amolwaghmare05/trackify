'use server';
import { generateMotivation, type GenerateMotivationInput, type GenerateMotivationOutput } from '@/ai/flows/ai-powered-motivation';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { z } from 'zod';

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

const authSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type AuthInput = z.infer<typeof authSchema>;

export async function signInWithEmail(data: AuthInput): Promise<{ error?: string }> {
  try {
    const auth = getAuth(app);
    await signInWithEmailAndPassword(auth, data.email, data.password);
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signUpWithEmail(data: AuthInput): Promise<{ error?: string }> {
  try {
    const auth = getAuth(app);
    await createUserWithEmailAndPassword(auth, data.email, data.password);
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signOutUser(): Promise<void> {
  const auth = getAuth(app);
  await signOut(auth);
}

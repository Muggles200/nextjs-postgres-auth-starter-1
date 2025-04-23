export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from 'app/lib/prisma';
import { auth } from 'app/auth';
import { logActivity, ActivityTypes } from 'app/lib/activity';
import { cache } from 'react';
import { z } from 'zod';

// Cache the user lookup
const getUser = cache(async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
});

// Cache the settings lookup
const getSettings = cache(async (userId: number) => {
  return prisma.userSettings.findUnique({
    where: { userId },
  });
});

// Validation schema
const settingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  profileVisibility: z.boolean().optional(),
  activitySharing: z.boolean().optional(),
  dataCollection: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
}).strict(); // Ensure no extra fields are allowed

// Common error response helper
const errorResponse = (message: string, status: number) => {
  return NextResponse.json({ error: message }, { status });
};

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await getUser(session.user.email);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const settings = await getSettings(user.id);
    
    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await prisma.userSettings.create({
        data: { userId: user.id },
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return errorResponse('Internal Server Error', 500);
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await getUser(session.user.email);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const body = await request.json();
    
    // Validate settings data
    const validationResult = settingsSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse('Invalid settings data', 400);
    }
    
    const settingsData = validationResult.data;
    
    // Only update fields that were actually provided
    const nonEmptyFields = Object.fromEntries(
      Object.entries(settingsData).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(nonEmptyFields).length === 0) {
      return errorResponse('No valid settings provided', 400);
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: nonEmptyFields,
      create: {
        userId: user.id,
        ...nonEmptyFields,
      },
    });

    // Log the settings update activity
    await logActivity(ActivityTypes.SETTINGS_CHANGE, 'User updated their settings', {
      updatedFields: Object.keys(nonEmptyFields),
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid settings data', 400);
    }
    
    return errorResponse('Internal Server Error', 500);
  }
}
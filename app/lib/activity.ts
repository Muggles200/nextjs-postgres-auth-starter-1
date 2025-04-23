import { auth } from 'app/auth';
import { prisma } from 'app/lib/prisma';
import { cache } from 'react';

// Define proper types for activity metadata
interface ActivityMetadata {
  [key: string]: any;
}

// Cache the user lookup to avoid repeated database queries
const getUser = cache(async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
});

export async function logActivity(
  type: string,
  description: string,
  metadata?: ActivityMetadata
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      console.error('Cannot log activity: No authenticated user');
      return;
    }

    // Use cached user lookup
    const user = await getUser(session.user.email);
    if (!user) {
      console.error('Cannot log activity: User not found');
      return;
    }

    // Create the activity with proper typing
    const activity = await prisma.userActivity.create({
      data: {
        userId: user.id,
        type,
        description,
        metadata: metadata || {},
      },
      select: {
        id: true,
        type: true,
        description: true,
        createdAt: true,
      },
    });

    return activity;
  } catch (error) {
    // Log the error but don't throw to prevent breaking the main flow
    console.error('Error logging activity:', error);
    return null;
  }
}

// Common activity types with proper typing
export const ActivityTypes = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE_UPDATE: 'profile_update',
  SETTINGS_CHANGE: 'settings_change',
  PASSWORD_CHANGE: 'password_change',
  EMAIL_CHANGE: 'email_change',
  ROLE_CHANGE: 'role_change',
  ACCOUNT_DELETE: 'account_delete',
} as const;

// Type for activity types
export type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes]; 
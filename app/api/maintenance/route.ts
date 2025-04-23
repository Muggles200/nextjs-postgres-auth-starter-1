import { NextResponse } from 'next/server';
import { prisma } from 'app/lib/prisma';

export async function GET() {
  try {
    const maintenanceSetting = await prisma.settings.findUnique({
      where: { key: 'maintenanceMode' },
    });

    return NextResponse.json({
      isMaintenanceMode: maintenanceSetting?.value === 'true'
    });
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return NextResponse.json({ isMaintenanceMode: false });
  }
} 
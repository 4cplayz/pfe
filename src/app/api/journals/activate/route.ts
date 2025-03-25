// src/app/api/journals/activate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/journals/activate - Active un journal et désactive tous les autres
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du journal non fourni' },
        { status: 400 }
      );
    }
    
    // Vérifier si le journal existe
    const journalExists = await prisma.journal.findUnique({
      where: { id },
    });
    
    if (!journalExists) {
      return NextResponse.json(
        { error: 'Journal non trouvé' },
        { status: 404 }
      );
    }
    
    // Désactiver tous les journaux
    await prisma.journal.updateMany({
      data: {
        isActive: false,
      },
    });
    
    // Activer uniquement le journal sélectionné
    const activatedJournal = await prisma.journal.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
    
    return NextResponse.json(activatedJournal);
  } catch (error) {
    console.error('Erreur lors de l\'activation du journal:', error);
    return NextResponse.json(
      { error: 'Échec de l\'activation du journal', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/ux/nav';
import confetti from 'canvas-confetti';

export default function RemerciementPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement pour l'animation
    const timer = setTimeout(() => {
      setLoading(false);

      // Lancer le confetti quand la page est chargée
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex flex-1 items-center justify-center p-6">
        <div className={`transform transition-all duration-700 ease-in-out ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-md">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-16 w-16 text-primary" />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                Merci pour votre soumission !
              </h2>
            </div>

            <div className="border-t pt-4">
              <p className="text-center text-sm text-muted-foreground">
                Votre journal de bord a été enregistré avec succès.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Plateforme de Journalisation Numérique pour Étudiants
      </footer>
    </div>
  );
}
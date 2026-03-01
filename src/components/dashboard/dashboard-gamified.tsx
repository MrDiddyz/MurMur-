'use client';

import { useEffect, useState } from 'react';

type Module = {
  id: string;
  name: string;
  description: string | null;
};

type UserBadge = {
  badge_id: string;
};

export default function DashboardGamified({ userId }: { userId: string }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    fetch('/api/modules/unlocked', {
      headers: { 'x-user-id': userId },
    })
      .then((res) => res.json())
      .then(({ unlockedModules, badges: awardedBadges }) => {
        setModules(unlockedModules ?? []);
        setBadges(awardedBadges ?? []);
      });
  }, [userId]);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Modules</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {modules.map((module) => (
            <div key={module.id} className="module-card animate-fadeInUp rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-semibold">{module.name}</h3>
              <p className="text-white/80">{module.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-3">
          {badges.map((badge) => (
            <div key={badge.badge_id} className="badge animate-pop rounded-full bg-cyan-500/20 px-3 py-1 text-cyan-200">
              {badge.badge_id}
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.5s forwards;
        }

        .animate-pop {
          animation: pop 0.5s forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pop {
          0% {
            transform: scale(0);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

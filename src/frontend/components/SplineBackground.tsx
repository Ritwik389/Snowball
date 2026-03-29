'use client';

import Spline, { type SplineEvent } from '@splinetool/react-spline';
import { useRouter } from 'next/navigation';

const ACTIONS: Array<{ match: string[]; href: string }> = [
  { match: ['lets do it', "let's do it", 'launch mission', 'get started', 'sign in'], href: '/auth/signin' },
  { match: ['how it works', 'how snowball works'], href: '/how-it-works' },
];

export default function SplineBackground() {
  const router = useRouter();

  const handleSplineAction = (event: SplineEvent) => {
    const targetName = event.target.name?.trim().toLowerCase();
    const targetId = 'uuid' in event.target ? event.target.uuid : undefined;

    console.debug('[spline] interaction', {
      name: event.target.name,
      id: targetId,
    });

    if (!targetName) {
      return;
    }

    const action = ACTIONS.find(({ match }) =>
      match.some((candidate) => targetName.includes(candidate))
    );

    if (action) {
      router.push(action.href);
    }
  };

  return (
    <div className="fixed inset-0 z-0">
      <Spline
        scene="https://prod.spline.design/jUs4wqRIMRdVu313/scene.splinecode"
        onSplineMouseDown={handleSplineAction}
        onSplineMouseUp={handleSplineAction}
      />
    </div>
  );
}

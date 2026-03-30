'use client';

import Spline, { type SplineEvent } from '@splinetool/react-spline';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/frontend/context/ThemeContext';

const ACTIONS: Array<{ match: string[]; href: string }> = [
  { match: ['lets do it', "let's do it", 'launch mission', 'get started', 'sign in'], href: '/auth/signin' },
  { match: ['how it works', 'how snowball works'], href: '/how-it-works' },
];

const LIGHT_MODE_SCENE = 'https://prod.spline.design/jUs4wqRIMRdVu313/scene.splinecode';
const DARK_MODE_SCENE = 'https://prod.spline.design/6TzaWCytLe5704TI/scene.splinecode';

export default function SplineBackground() {
  const router = useRouter();
  const { theme } = useTheme();

  const scene = theme === 'light' ? LIGHT_MODE_SCENE : DARK_MODE_SCENE;

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
        key={theme}
        scene={scene}
        onSplineMouseDown={handleSplineAction}
        onSplineMouseUp={handleSplineAction}
      />
    </div>
  );
}

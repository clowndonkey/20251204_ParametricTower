import gsap from 'gsap';
import type { TowerParameterState } from '../types/params';

type Listener = (state: TowerParameterState) => void;

const isTweenable = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

export class ParamAnimator {
  private state: TowerParameterState;

  private listeners = new Set<Listener>();

  constructor(initial: TowerParameterState) {
    this.state = { ...initial };
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  tweenTo(next: TowerParameterState) {
    const tweenPayload: Record<string, number> = {};

    (Object.keys(next) as Array<keyof TowerParameterState>).forEach(
      (key) => {
        const value = next[key];
        if (key === 'animationDuration') {
          this.state.animationDuration = value as number;
          return;
        }

        if (isTweenable(value)) {
          tweenPayload[key as string] = value;
          return;
        }

        (
          (this.state as unknown as Record<string, unknown>)[key as string]
        ) = value;
      },
    );

    const duration = next.animationDuration;

    gsap.to(this.state, {
      ...tweenPayload,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => this.emit(),
      onComplete: () => this.emit(),
    });
  }

  private emit() {
    const snapshot = { ...this.state };
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

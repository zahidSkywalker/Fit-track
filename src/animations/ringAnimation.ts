import gsap from 'gsap';

/**
 * GSAP-based ring/progress circle animation utilities.
 * Used for complex animated rings beyond Framer Motion's scope.
 */

interface RingAnimationOptions {
  /** SVG circle element */
  element: SVGCircleElement;
  /** Target percentage 0-100 */
  percent: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Easing function */
  ease?: string;
  /** Delay in seconds */
  delay?: number;
  /** Callback on complete */
  onComplete?: () => void;
  /** Callback on update — receives current percent */
  onUpdate?: (currentPercent: number) => void;
}

/**
 * Animate an SVG circle's stroke-dashoffset to represent a progress ring.
 * The circle must have stroke-dasharray set to its circumference.
 */
export function animateRing(options: RingAnimationOptions): gsap.core.Tween {
  const {
    element,
    percent,
    duration = 1.2,
    ease = 'power2.out',
    delay = 0.3,
    onComplete,
    onUpdate,
  } = options;

  const circumference = parseFloat(element.getAttribute('stroke-dasharray') || '0');
  const targetOffset = circumference - (Math.max(0, Math.min(100, percent)) / 100) * circumference;

  const tween = gsap.fromTo(
    element,
    { strokeDashoffset: circumference },
    {
      strokeDashoffset: targetOffset,
      duration,
      ease,
      delay,
      onComplete,
      onUpdate() {
        if (onUpdate) {
          const currentOffset = parseFloat(gsap.getProperty(element, 'strokeDashoffset') as string);
          const currentPercent = ((circumference - currentOffset) / circumference) * 100;
          onUpdate(Math.max(0, Math.min(100, currentPercent)));
        }
      },
    }
  );

  return tween;
}

/**
 * Animate multiple concentric rings in sequence.
 */
export function animateMultipleRings(
  rings: Array<{
    element: SVGCircleElement;
    percent: number;
    color?: string;
  }>,
  options: {
    duration?: number;
    stagger?: number;
    ease?: string;
  } = {}
): gsap.core.Timeline {
  const { duration = 1, stagger = 0.15, ease = 'power2.out' } = options;

  const tl = gsap.timeline();

  rings.forEach((ring) => {
    const circumference = parseFloat(ring.element.getAttribute('stroke-dasharray') || '0');
    const targetOffset = circumference - (Math.max(0, Math.min(100, ring.percent)) / 100) * circumference;

    tl.fromTo(
      ring.element,
      { strokeDashoffset: circumference },
      {
        strokeDashoffset: targetOffset,
        duration,
        ease,
      },
      stagger
    );
  });

  return tl;
}

/**
 * Create a pulsing ring animation (for active states like HR monitoring).
 */
export function pulseRing(
  element: SVGCircleElement,
  options: {
    scaleRange?: number;
    duration?: number;
    opacityRange?: [number, number];
    repeat?: number;
  } = {}
): gsap.core.Tween {
  const {
    scaleRange = 0.05,
    duration = 1,
    opacityRange = [0.8, 1],
    repeat = -1,
  } = options;

  return gsap.to(element, {
    attr: {
      'stroke-opacity': opacityRange[1],
    },
    duration: duration / 2,
    yoyo: true,
    repeat,
    ease: 'sine.inOut',
    onUpdate() {
      const progress = gsap.getProperty(element, 'stroke-opacity') as number;
      const scale = 1 + (progress - opacityRange[0]) / (opacityRange[1] - opacityRange[0]) * scaleRange;
      gsap.set(element, {
        attr: {
          transform: `scale(${scale})`,
          'transform-origin': 'center center',
        },
      });
    },
  });
}

/**
 * Count-up number animation to pair with ring animations.
 */
export function animateCountUp(
  element: HTMLElement,
  options: {
    from?: number;
    to: number;
    duration?: number;
    delay?: number;
    ease?: string;
    formatter?: (value: number) => string;
    onUpdate?: (value: number) => void;
  }
): gsap.core.Tween {
  const {
    from = 0,
    to,
    duration = 1.2,
    delay = 0.3,
    ease = 'power2.out',
    formatter = (v) => String(Math.round(v)),
    onUpdate,
  } = options;

  const obj = { value: from };

  return gsap.to(obj, {
    value: to,
    duration,
    delay,
    ease,
    onUpdate() {
      element.textContent = formatter(obj.value);
      onUpdate?.(obj.value);
    },
  });
}

/**
 * Kill all ring-related animations (for cleanup).
 */
export function killRingAnimations(): void {
  gsap.killTweensOf('[stroke-dashoffset]');
}

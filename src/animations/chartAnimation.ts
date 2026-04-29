import gsap from 'gsap';

/**
 * GSAP animation utilities for custom SVG charts.
 * These complement the React-based MiniChart component
 * with more complex animation sequences.
 */

interface BarAnimationOptions {
  elements: SVGRectElement[];
  data: number[];
  maxHeight: number;
  duration?: number;
  stagger?: number;
  ease?: string;
  delay?: number;
  color?: string;
}

/**
 * Animate bars growing from bottom to their target height.
 */
export function animateBars(options: BarAnimationOptions): gsap.core.Timeline {
  const {
    elements,
    data,
    maxHeight,
    duration = 0.6,
    stagger = 0.05,
    ease = 'power2.out',
    delay = 0.2,
  } = options;

  const maxVal = Math.max(...data, 1);
  const tl = gsap.timeline({ delay });

  elements.forEach((bar, i) => {
    const targetH = (data[i] / maxVal) * maxHeight;
    const targetY = maxHeight - targetH;

    tl.fromTo(
      bar,
      { attr: { height: 0, y: maxHeight }, opacity: 0.6 },
      {
        attr: { height: Math.max(2, targetH), y: targetY },
        opacity: 1,
        duration,
        ease,
      },
      i * stagger
    );
  });

  return tl;
}

interface LineDrawOptions {
  pathElement: SVGPathElement;
  fillElement?: SVGPathElement;
  dotElements?: SVGCircleElement[];
  duration?: number;
  ease?: string;
  delay?: number;
}

/**
 * Draw a line chart path with optional fill fade-in and dot pop-in.
 */
export function animateLineDraw(options: LineDrawOptions): gsap.core.Timeline {
  const {
    pathElement,
    fillElement,
    dotElements = [],
    duration = 1.2,
    ease = 'power2.inOut',
    delay = 0.3,
  } = options;

  const tl = gsap.timeline({ delay });

  const pathLength = pathElement.getTotalLength();
  gsap.set(pathElement, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

  tl.to(pathElement, {
    strokeDashoffset: 0,
    duration,
    ease,
  });

  if (fillElement) {
    gsap.set(fillElement, { opacity: 0 });
    tl.to(
      fillElement,
      {
        opacity: 1,
        duration: duration * 0.5,
        ease: 'power2.out',
      },
      duration * 0.6
    );
  }

  if (dotElements.length > 0) {
    gsap.set(dotElements, { scale: 0, opacity: 0, transformOrigin: 'center center' });
    tl.to(
      dotElements,
      {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        stagger: 0.04,
        ease: 'back.out(2)',
      },
      duration * 0.8
    );
  }

  return tl;
}

/**
 * Animate a calorie curve (sine-like wave) for the marathon/workout screen.
 */
export function animateCalorieCurve(
  pathElement: SVGPathElement,
  options: {
    duration?: number;
    delay?: number;
    color?: string;
    glowColor?: string;
  } = {}
): gsap.core.Timeline {
  const { duration = 2, delay = 0.5 } = options;

  const tl = gsap.timeline({ delay });
  const pathLength = pathElement.getTotalLength();

  gsap.set(pathElement, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  });

  tl.to(pathElement, {
    strokeDashoffset: 0,
    duration,
    ease: 'power1.inOut',
  });

  return tl;
}

/**
 * Animate horizontal grid lines fading in.
 */
export function animateGridLines(
  lines: SVGLineElement[],
  options: {
    duration?: number;
    stagger?: number;
    delay?: number;
  } = {}
): gsap.core.Timeline {
  const { duration = 0.4, stagger = 0.05, delay = 0.1 } = options;

  const tl = gsap.timeline({ delay });

  tl.fromTo(
    lines,
    { opacity: 0 },
    {
      opacity: 1,
      duration,
      stagger,
      ease: 'power2.out',
    }
  );

  return tl;
}

/**
 * Animate value labels appearing above chart bars/points.
 */
export function animateValueLabels(
  elements: SVGTextElement[],
  options: {
    duration?: number;
    stagger?: number;
    delay?: number;
    fromBelow?: boolean;
  } = {}
): gsap.core.Timeline {
  const {
    duration = 0.3,
    stagger = 0.04,
    delay = 0.8,
    fromBelow = true,
  } = options;

  const tl = gsap.timeline({ delay });

  tl.fromTo(
    elements,
    {
      opacity: 0,
      y: fromBelow ? 8 : -8,
    },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease: 'power2.out',
    }
  );

  return tl;
}

/**
 * Shimmer/pulse effect on a chart element to indicate "live" data.
 */
export function livePulse(
  element: SVGElement,
  options: {
    duration?: number;
    repeat?: number;
    ease?: string;
  } = {}
): gsap.core.Tween {
  const { duration = 1.5, repeat = -1, ease = 'sine.inOut' } = options;

  return gsap.to(element, {
    attr: { opacity: 0.5 },
    duration: duration / 2,
    yoyo: true,
    repeat,
    ease,
  });
}

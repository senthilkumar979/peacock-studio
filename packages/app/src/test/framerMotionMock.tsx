import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';

type MotionProps = Record<string, unknown> & {
  children?: ReactNode;
};

const MOTION_PROP_KEYS = new Set([
  'animate',
  'exit',
  'initial',
  'layout',
  'layoutId',
  'transition',
  'variants',
  'viewport',
  'whileHover',
  'whileInView',
  'whileTap',
]);

function stripMotionProps(props: MotionProps): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!MOTION_PROP_KEYS.has(key)) clean[key] = value;
  }
  return clean;
}

function motionTag(tag: string) {
  return ({ children, ...props }: MotionProps) =>
    createElement(tag, stripMotionProps(props), children);
}

/** Lightweight framer-motion stand-in that preserves semantic HTML tags. */
export const framerMotionMock = {
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => motionTag(prop),
    },
  ),
  AnimatePresence: ({ children }: { children?: ReactNode }) => children,
  MotionConfig: ({ children }: { children?: ReactNode }) => children,
  useReducedMotion: () => true,
  useInView: () => true,
  useAnimation: () => ({ start: () => undefined, stop: () => undefined }),
  useScroll: () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } }),
  useTransform: (_v: unknown, _i: unknown, output: unknown) => output,
};

export type FramerMotionMock = typeof framerMotionMock;

/** Satisfy TS when spreading into createElement for known tags. */
export type MotionDivProps = ComponentPropsWithoutRef<'div'>;

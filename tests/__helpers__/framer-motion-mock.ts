import React from "react";

// Strip framer-motion props and render plain HTML elements.
// Components are memoized per tag so the element type stays stable across
// renders — a fresh component type per render makes React unmount/remount the
// whole subtree, detaching DOM nodes (breaks focus, controlled inputs, etc.).
const cache = new Map<string, React.ComponentType<Record<string, unknown>>>();

function getMotionComponent(tag: string) {
  let component = cache.get(tag);
  if (!component) {
    component = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
      const {
        initial,
        animate,
        exit,
        whileHover,
        whileTap,
        whileInView,
        variants,
        layout,
        transition,
        viewport,
        ...rest
      } = props as Record<string, unknown>;
      void initial;
      void animate;
      void exit;
      void whileHover;
      void whileTap;
      void whileInView;
      void variants;
      void layout;
      void transition;
      void viewport;
      return React.createElement(tag, { ...rest, ref });
    });
    component.displayName = `motion.${tag}`;
    cache.set(tag, component);
  }
  return component;
}

const motionProxy = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (typeof prop !== "string") return undefined;
      return getMotionComponent(prop);
    },
  }
);

export const motion = motionProxy;

export const AnimatePresence = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

export const useAnimation = () => ({
  start: jest.fn(),
  set: jest.fn(),
  stop: jest.fn(),
});
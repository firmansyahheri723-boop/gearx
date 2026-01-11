import { Component, createEffect, onMount } from 'solid-js';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface FormulaProps {
  /** LaTeX formula string */
  math: string;
  /** Display mode (block) vs inline */
  displayMode?: boolean;
  /** Additional CSS classes */
  class?: string;
}

/**
 * KaTeX formula rendering component
 * Renders LaTeX math formulas using KaTeX
 */
export const Formula: Component<FormulaProps> = (props) => {
  let containerRef: HTMLSpanElement | undefined;

  const render = () => {
    if (containerRef && props.math) {
      try {
        katex.render(props.math, containerRef, {
          displayMode: props.displayMode ?? false,
          throwOnError: false,
          strict: false,
        });
      } catch (e) {
        console.error('KaTeX render error:', e);
        containerRef.textContent = props.math;
      }
    }
  };

  onMount(render);
  createEffect(render);

  return (
    <span
      ref={containerRef}
      class={props.class}
      classList={{
        'katex-display-wrapper': props.displayMode,
      }}
    />
  );
};

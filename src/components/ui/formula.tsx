import { createEffect, onMount } from 'solid-js';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export type FormulaProps = {
  math: string;
  displayMode?: boolean;
  class?: string;
}

export function Formula(props: FormulaProps) {
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
}

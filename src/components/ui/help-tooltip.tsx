import { Component, Show, For, createSignal, onCleanup, onMount } from "solid-js";

export interface HelpLink {
  label: string;
  url: string;
}

export type TooltipPosition = "right" | "bottom" | "left" | "top";

export interface HelpTooltipProps {
  description: string;
  articles?: HelpLink[];
  videos?: HelpLink[];
  position?: TooltipPosition;
}

// Position styles for the tooltip popup
const getPositionStyles = (position: TooltipPosition) => {
  switch (position) {
    case "right":
      // Arrow points left (toward the button)
      return {
        popup: "left-6 top-1/2 -translate-y-1/2",
        arrow: "left-0 top-1/2 -translate-x-1 -translate-y-1/2 rotate-45 border-l border-b",
      };
    case "bottom":
      // Arrow points up (toward the button)
      return {
        popup: "top-6 left-1/2 -translate-x-1/2",
        arrow: "top-0 left-1/2 -translate-y-1 -translate-x-1/2 rotate-45 border-l border-t",
      };
    case "left":
      // Arrow points right (toward the button)
      return {
        popup: "right-6 top-1/2 -translate-y-1/2",
        arrow: "right-0 top-1/2 translate-x-1 -translate-y-1/2 rotate-45 border-r border-t",
      };
    case "top":
      // Arrow points down (toward the button)
      return {
        popup: "bottom-6 left-1/2 -translate-x-1/2",
        arrow: "bottom-0 left-1/2 translate-y-1 -translate-x-1/2 rotate-45 border-r border-b",
      };
  }
};

export const HelpTooltip: Component<HelpTooltipProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  const position = () => props.position ?? "right";
  const positionStyles = () => getPositionStyles(position());

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  const toggle = (e: MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen());
  };

  const hasLinks = () =>
    (props.articles && props.articles.length > 0) ||
    (props.videos && props.videos.length > 0);

  return (
    <div ref={containerRef} class="relative inline-flex items-center">
      {/* Help Icon Button */}
      <button
        type="button"
        onClick={toggle}
        class="w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full border transition-all duration-100"
        classList={{
          "bg-cyan-500/20 text-cyan-400 border-cyan-500/50": isOpen(),
          "bg-slate-800/50 text-slate-500 border-slate-600/50 hover:text-cyan-400 hover:border-cyan-500/50":
            !isOpen(),
        }}
        aria-label="Show help information"
        aria-expanded={isOpen()}
      >
        ?
      </button>

      {/* Tooltip Popup */}
      <Show when={isOpen()}>
        <div
          class={`absolute z-50 w-72 border border-cyan-500/30 bg-slate-900/95 backdrop-blur-sm shadow-lg shadow-black/50 ${positionStyles().popup}`}
          role="tooltip"
        >
          {/* Header */}
          <div class="flex items-center gap-2 px-3 py-1.5 border-b border-slate-700/50 bg-slate-800/50">
            <div class="w-1 h-3 bg-cyan-500" />
            <span class="text-[10px] font-bold tracking-wider uppercase text-cyan-400">
              INFO
            </span>
          </div>

          {/* Content */}
          <div class="px-3 py-2">
            <p class="text-xs text-slate-300 leading-relaxed">
              {props.description}
            </p>
          </div>

          {/* Links Section */}
          <Show when={hasLinks()}>
            <div class="border-t border-slate-700/50 bg-slate-800/30">
              {/* Read More Links */}
              <Show when={props.articles && props.articles.length > 0}>
                <div class="px-3 py-2">
                  <div class="flex items-center gap-1.5 mb-1.5">
                    <svg
                      class="w-3 h-3 text-cyan-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span class="text-[10px] font-bold tracking-wider uppercase text-cyan-400">
                      Read More
                    </span>
                  </div>
                  <ul class="space-y-1">
                    <For each={props.articles}>
                      {(link) => (
                        <li>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors group"
                          >
                            <span class="text-slate-600 group-hover:text-cyan-500">
                              •
                            </span>
                            <span class="flex-1">{link.label}</span>
                            <svg
                              class="w-2.5 h-2.5 opacity-50 group-hover:opacity-100"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                stroke-linecap="square"
                                stroke-width="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </Show>

              {/* Watch Video Links */}
              <Show when={props.videos && props.videos.length > 0}>
                <div
                  class="px-3 py-2"
                  classList={{
                    "border-t border-slate-700/30":
                      props.articles && props.articles.length > 0,
                  }}
                >
                  <div class="flex items-center gap-1.5 mb-1.5">
                    <svg
                      class="w-3 h-3 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    <span class="text-[10px] font-bold tracking-wider uppercase text-red-400">
                      Watch Video
                    </span>
                  </div>
                  <ul class="space-y-1">
                    <For each={props.videos}>
                      {(link) => (
                        <li>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-red-300 transition-colors group"
                          >
                            <span class="text-slate-600 group-hover:text-red-500">
                              •
                            </span>
                            <span class="flex-1">{link.label}</span>
                            <svg
                              class="w-2.5 h-2.5 opacity-50 group-hover:opacity-100"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </a>
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </Show>
            </div>
          </Show>

          {/* Arrow pointer */}
          <div
            class={`absolute w-2 h-2 bg-slate-900/95 border-cyan-500/30 ${positionStyles().arrow}`}
          />
        </div>
      </Show>
    </div>
  );
};

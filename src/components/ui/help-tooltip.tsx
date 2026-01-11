import { Component, Show, For } from "solid-js";
import { Formula } from "./formula";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPositioner,
  PopoverContent,
  PopoverArrow,
  PopoverArrowTip,
} from "@ark-ui/solid/popover";
import type { HelpLink } from "../../types";

export type TooltipPosition = "right" | "bottom" | "left" | "top";

export interface HelpTooltipProps {
  description: string;
  /** LaTeX formula to display */
  formula?: string;
  /** Variable definitions for the formula */
  variables?: string[];
  articles?: HelpLink[];
  videos?: HelpLink[];
  position?: TooltipPosition;
}

export const HelpTooltip: Component<HelpTooltipProps> = (props) => {
  const position = () => props.position ?? "right";

  const hasLinks = () =>
    (props.articles && props.articles.length > 0) ||
    (props.videos && props.videos.length > 0);

  return (
    <PopoverRoot
      positioning={{
        placement: position(),
        gutter: 8,
      }}
      closeOnInteractOutside={true}
    >
      <PopoverTrigger
        type="button"
        class="w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full border transition-all duration-100 data-[state=open]:bg-foreground/20 data-[state=open]:text-foreground-secondary data-[state=open]:border-border/50 bg-surface-elevated/50 text-muted border-border/50 hover:text-foreground-secondary hover:border-border/50"
        aria-label="Show help information"
      >
        ?
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent
          class="z-50 w-80 border border-border/30 bg-surface/95 backdrop-blur-sm shadow-lg shadow-black/50"
          role="tooltip"
        >
          <PopoverArrow>
            <PopoverArrowTip />
          </PopoverArrow>

          {/* Header */}
          <div class="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-surface-elevated/50">
            <div class="w-1 h-3 bg-muted" />
            <span class="text-[10px] font-bold tracking-wider uppercase text-foreground-secondary">
              INFO
            </span>
          </div>

          {/* Content */}
          <div class="px-3 py-2">
            <p class="text-xs text-foreground leading-relaxed normal-case tracking-normal text-left">
              {props.description}
            </p>
          </div>

          {/* Formula Section */}
          <Show when={props.formula}>
            <div class="border-t border-border/50 bg-surface-elevated/20 px-3 py-2">
              <div class="flex items-center gap-1.5 mb-2">
                <svg
                  class="w-3 h-3 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span class="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                  Formula
                </span>
              </div>
              <div class="bg-background/50 border border-border/30 px-3 py-2 rounded overflow-x-auto">
                <Formula math={props.formula!} displayMode class="text-foreground" />
              </div>
              <Show when={props.variables && props.variables.length > 0}>
                <div class="mt-2 space-y-0.5">
                  <For each={props.variables}>
                    {(variable) => (
                      <div class="text-[10px] text-muted font-mono">
                        {variable}
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </Show>

          {/* Links Section */}
          <Show when={hasLinks()}>
            <div class="border-t border-border/50 bg-surface-elevated/30">
              {/* Read More Links */}
              <Show when={props.articles && props.articles.length > 0}>
                <div class="px-3 py-2">
                  <div class="flex items-center gap-1.5 mb-1.5">
                    <svg
                      class="w-3 h-3 text-muted"
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
                    <span class="text-[10px] font-bold tracking-wider uppercase text-foreground-secondary">
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
                            class="flex items-center gap-1.5 text-[11px] text-foreground-secondary hover:text-foreground transition-colors group"
                          >
                            <span class="text-muted group-hover:text-muted">
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
                    "border-t border-border/30":
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
                            class="flex items-center gap-1.5 text-[11px] text-foreground-secondary hover:text-red-300 transition-colors group"
                          >
                            <span class="text-muted group-hover:text-red-500">
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
        </PopoverContent>
      </PopoverPositioner>
    </PopoverRoot>
  );
};

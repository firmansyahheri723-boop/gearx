import { beforeEach, afterEach, vi } from "vitest";

beforeEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

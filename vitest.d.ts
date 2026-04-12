declare module "vitest" {
  export function describe(name: string, fn: () => void): void;
  export function it(
    name: string,
    fn: () => void | Promise<void>
  ): void;
  export const expect: {
    any: (value: unknown) => unknown;
    [key: string]: unknown;
  } & ((value: unknown) => {
    toBe: (expected: unknown) => void;
    toContain: (expected: unknown) => void;
    toMatchObject: (expected: unknown) => void;
    toBeNull: () => void;
    toBeGreaterThan: (expected: number) => void;
    toBeGreaterThanOrEqual: (expected: number) => void;
    toBeLessThanOrEqual: (expected: number) => void;
    not: {
      toBeNull: () => void;
    };
  });
}

declare module "vitest/config" {
  export function defineConfig(config: unknown): unknown;
}

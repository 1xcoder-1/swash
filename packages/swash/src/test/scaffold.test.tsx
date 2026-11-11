import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { installWaapiMock } from "./waapi-mock";
import { __swashReady } from "../index";

describe("scaffold", () => {
  it("imports the package entry", () => {
    expect(__swashReady).toBe(true);
  });
  it("waapi mock records animate calls", () => {
    installWaapiMock();
    const { container } = render(<div />);
    const el = container.firstChild as HTMLElement;
    el.animate([], {});
    expect(((globalThis as any).__waapiCalls.get(el).length)).toBe(1);
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { installWaapiMock } from "./waapi-mock";
import { Counter } from "../index";

describe("scaffold", () => {
  it("imports the package entry", () => {
    expect(Counter).toBeTypeOf("function");
  });
  it("waapi mock records animate calls", () => {
    installWaapiMock();
    const { container } = render(<div />);
    const el = container.firstChild as HTMLElement;
    el.animate([], {});
    expect(((globalThis as any).__waapiCalls.get(el).length)).toBe(1);
  });
});

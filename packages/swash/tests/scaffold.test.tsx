import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { animateCallCount, installWaapiMock } from "./helpers/waapi-mock";
import { Counter } from "../src/index";

describe("scaffold", () => {
  it("imports the package entry", () => {
    expect(Counter).toBeTypeOf("function");
  });
  it("waapi mock records animate calls", () => {
    installWaapiMock();
    const { container } = render(<div />);
    const el = container.firstChild as HTMLElement;
    el.animate([], {});
    expect(animateCallCount(el)).toBe(1);
  });
});

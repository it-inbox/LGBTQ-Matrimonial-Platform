import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SelectableChip } from "./SelectableChip";

describe("SelectableChip Component", () => {
  it("renders children text accurately", () => {
    render(<SelectableChip>Music</SelectableChip>);
    expect(screen.getByText("Music")).toBeDefined();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<SelectableChip onClick={handleClick}>Reading</SelectableChip>);

    fireEvent.click(screen.getByText("Reading"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies selected gradient styling when selected is true", () => {
    const { container } = render(<SelectableChip selected>Gaming</SelectableChip>);
    const button = container.querySelector("button");

    expect(button?.className).toContain("bg-gradient-to-r");
    expect(button?.className).toContain("text-white");
  });

  it("applies unselected white styling when selected is false", () => {
    const { container } = render(<SelectableChip selected={false}>Gaming</SelectableChip>);
    const button = container.querySelector("button");

    expect(button?.className).toContain("bg-white");
    expect(button?.className).toContain("text-slate-700");
  });

  it("supports pill shape variant", () => {
    const { container } = render(<SelectableChip shape="pill">Pill Chip</SelectableChip>);
    const button = container.querySelector("button");

    expect(button?.className).toContain("rounded-full");
  });
});

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgeRangeSlider } from "./AgeRangeSlider";

describe("AgeRangeSlider Component", () => {
  it("renders with min and max age labels", () => {
    const handleChange = vi.fn();
    render(
      <AgeRangeSlider
        minAge={24}
        maxAge={32}
        onChange={handleChange}
        minLimit={18}
        maxLimit={75}
      />
    );

    expect(screen.getByText("24 yrs")).toBeDefined();
    expect(screen.getByText("32 yrs")).toBeDefined();
    expect(screen.getByText("Partner Age Range")).toBeDefined();
  });

  it("hides header label when hideLabel is true", () => {
    const handleChange = vi.fn();
    render(
      <AgeRangeSlider
        minAge={21}
        maxAge={29}
        onChange={handleChange}
        hideLabel
      />
    );

    expect(screen.queryByText("Partner Age Range")).toBeNull();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestimonialsSection } from "../TestimonialsSection";

describe("TestimonialsSection", () => {
  it("renders testimonial cards with optional ratings and meta", () => {
    render(
      <TestimonialsSection
        section={{
          type: "testimonials",
          eyebrow: "Proof",
          title: "Trusted by regulars",
          description: "A few kind words from happy customers.",
          items: [
            {
              quote: "The fastest checkout and the easiest reorder flow.",
              author: "Jamie",
              role: "Operations Lead",
              company: "Oak & Co",
              rating: 5,
            },
            {
              quote: "Everything felt clear from the first click.",
              author: "Morgan",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Trusted by regulars")).toBeInTheDocument();
    expect(
      screen.getByText(/The fastest checkout and the easiest reorder flow\./),
    ).toBeInTheDocument();
    expect(screen.getByText("Jamie")).toBeInTheDocument();
    expect(screen.getByText("Operations Lead, Oak & Co")).toBeInTheDocument();
    expect(screen.getByText("5 out of 5 stars")).toBeInTheDocument();
    expect(screen.getByText("Morgan")).toBeInTheDocument();
  });
});

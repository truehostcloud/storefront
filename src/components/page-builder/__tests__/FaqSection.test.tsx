import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaqSection } from "../FaqSection";

describe("FaqSection", () => {
  it("renders section copy and FAQ items", () => {
    render(
      <FaqSection
        section={{
          type: "faq",
          eyebrow: "Need to know",
          title: "Questions before checkout",
          description: "Helpful details that remove friction.",
          items: [
            {
              question: "How do I get started?",
              answer: "Browse the featured products and collections first.",
            },
            {
              question: "Where can I learn more?",
              answer: "Open the detail pages for more product information.",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Questions before checkout")).toBeInTheDocument();
    expect(
      screen.getByText("Helpful details that remove friction."),
    ).toBeInTheDocument();
    expect(screen.getByText("How do I get started?")).toBeInTheDocument();
    expect(
      screen.getByText("Browse the featured products and collections first."),
    ).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Loading from "./loading";

describe("Locale loading state", () => {
  it("renders a static fallback without tenant lookup", () => {
    render(<Loading />);

    expect(screen.getByText("Loading storefront")).toBeInTheDocument();
  });
});

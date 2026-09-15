import { render, screen } from "@testing-library/react";
import "./__helpers__/convex-mocks";
import "./__helpers__/auth-mocks";
import { mockUseQuery } from "./__helpers__/convex-mocks";
import { AppShell } from "@/components/layout/app-shell";
import { mockUseConvexAuth } from "./__helpers__/auth-mocks";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/",
}));

describe("AppShell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
    mockUseQuery.mockReturnValue({ email: "test@example.com", name: "Test" });
  });

  it("renders the StudyFlow logo and children when authenticated", () => {
    render(
      <AppShell>
        <div data-testid="child">Hello StudyFlow</div>
      </AppShell>
    );

    expect(screen.getAllByText("StudyFlow").length).toBeGreaterThan(0);
    expect(screen.getByTestId("child")).toHaveTextContent("Hello StudyFlow");
  });

  it("renders all desktop navigation items", () => {
    render(
      <AppShell>
        <span>content</span>
      </AppShell>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByText("Subjects")).toBeInTheDocument();
  });

  it("shows loading state while auth is loading", () => {
    mockUseConvexAuth.mockReturnValue({ isLoading: true, isAuthenticated: false });

    render(
      <AppShell>
        <div>Protected</div>
      </AppShell>
    );

    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("does not render children when unauthenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: false });

    render(
      <AppShell>
        <div>Protected</div>
      </AppShell>
    );

    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });
});
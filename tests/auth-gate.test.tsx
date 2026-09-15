import { render, screen, waitFor } from "@testing-library/react";
import "./__helpers__/convex-mocks";
import "./__helpers__/auth-mocks";
import { mockUseConvexAuth } from "./__helpers__/auth-mocks"
import { AuthGate } from "@/components/auth/auth-gate";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, refresh: jest.fn() }),
  usePathname: () => "/notes",
}));

describe("AuthGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state while auth is loading", () => {
    mockUseConvexAuth.mockReturnValue({ isLoading: true, isAuthenticated: false });
    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("redirects to login when not authenticated", async () => {
    mockUseConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: false });
    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/login?redirect=%2Fnotes")
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("does not redirect while still loading", () => {
    mockUseConvexAuth.mockReturnValue({ isLoading: true, isAuthenticated: false });
    render(
      <AuthGate>
        <div>Protected content</div>
      </AuthGate>
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
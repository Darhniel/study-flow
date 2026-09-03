import { render, screen, waitFor } from "@testing-library/react";
import "./__helpers__/auth-mocks";
import { mockUseConvexAuth } from "./__helpers__/auth-mocks";
import { AuthGate } from "@/components/auth/auth-gate";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard",
}));

describe("AuthGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state when auth is loading", () => {
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

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?redirect=%2Fdashboard");
    });
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
    expect(mockPush).not.toHaveBeenCalled();
  });
});
import { render, screen } from "@testing-library/react";
import "./__helpers__/convex-mocks";
import "./__helpers__/auth-mocks";
import { mockUseQuery } from "./__helpers__/convex-mocks";
import { mockUseConvexAuth } from "./__helpers__/auth-mocks";
import DashboardPage from "@/app/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/",
}));

describe("Dashboard empty state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
  });

  it("renders with zeros when all data is undefined", () => {
    mockUseQuery.mockReturnValue(undefined);
    render(<DashboardPage />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    // All stat cards should show 0
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("Total notes")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Subjects")).toBeInTheDocument();
  });

  it("renders with zeros when all data is empty", () => {
    mockUseQuery.mockImplementation((name: string) => {
      if (name === "notes:count") return 0;
      if (name === "notes:countByStatus") return 0;
      if (name === "subjects:count") return 0;
      if (name === "notes:listRecentlyUpdated") return [];
      if (name === "notes:listWithStudyMaterial") return [];
      return undefined;
    });

    render(<DashboardPage />);

    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
  });

  it("shows empty state for recent notes when array is empty", () => {
    mockUseQuery.mockImplementation((name: string) => {
      if (name === "notes:count") return 5;
      if (name === "notes:countByStatus") return 2;
      if (name === "subjects:count") return 3;
      if (name === "notes:listRecentlyUpdated") return [];
      if (name === "notes:listWithStudyMaterial") return [];
      return undefined;
    });

    render(<DashboardPage />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
  });

  it("renders Create Note CTA in empty state", () => {
    mockUseQuery.mockReturnValue(undefined);
    render(<DashboardPage />);

    expect(screen.getByRole("link", { name: /create note/i })).toBeInTheDocument();
  });

  it("renders progress bar showing 0/0 when no notes", () => {
    mockUseQuery.mockImplementation((name: string) => {
      if (name === "notes:count") return 0;
      if (name === "notes:countByStatus") return 0;
      if (name === "subjects:count") return 0;
      if (name === "notes:listRecentlyUpdated") return [];
      if (name === "notes:listWithStudyMaterial") return [];
      return undefined;
    });

    render(<DashboardPage />);

    expect(screen.getByText("Study progress")).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 0 notes/i)).toBeInTheDocument();
  });
});
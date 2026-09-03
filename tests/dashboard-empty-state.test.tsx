import { render, screen } from "@testing-library/react";
import "./__helpers__/convex-mocks";
import { mockUseQuery } from "./__helpers__/convex-mocks";
import DashboardPage from "@/app/page";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
    usePathname: () => "/",
}));

describe("Dashboard empty state", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders with zeros when all data is undefined", () => {
        mockUseQuery.mockReturnValue(undefined);

        render(<DashboardPage />);

        expect(screen.getByText("Welcome back")).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();
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

        expect(screen.getByText("0")).toBeInTheDocument();
        expect(screen.getByText("No notes yet")).toBeInTheDocument();
    });

    it("renders recent notes empty state when recentNotes is empty array", () => {
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
        expect(screen.getByText("No notes yet. Create your first note to get started.")).toBeInTheDocument();
    });

    it("renders create note CTA in empty state", () => {
        mockUseQuery.mockReturnValue(undefined);

        render(<DashboardPage />);

        expect(screen.getByRole("button", { name: /create note/i })).toBeInTheDocument();
    });
});
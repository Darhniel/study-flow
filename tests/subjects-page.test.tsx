import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/convex-mocks";
import { mockUseQuery, mockUseMutation } from "./__helpers__/convex-mocks";
import { makeSubjectId } from "./__helpers__/convex-mocks";
import SubjectsPage from "@/app/subjects/page";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
    usePathname: () => "/subjects",
}));

describe("SubjectsPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading state", () => {
        mockUseQuery.mockReturnValue(undefined);
        render(<SubjectsPage />);
        expect(screen.getByText("Subjects")).toBeInTheDocument();
    });

    it("renders subjects with stats", () => {
        mockUseQuery.mockReturnValue([
            {
                _id: makeSubjectId("s1"),
                name: "Mathematics",
                noteCount: 5,
                completedCount: 2,
                lastUpdated: Date.now(),
            },
            {
                _id: makeSubjectId("s2"),
                name: "Biology",
                noteCount: 3,
                completedCount: 1,
                lastUpdated: Date.now(),
            },
        ]);

        render(<SubjectsPage />);

        expect(screen.getByText("Mathematics")).toBeInTheDocument();
        expect(screen.getByText("Biology")).toBeInTheDocument();
        expect(screen.getByText("5 notes")).toBeInTheDocument();
        expect(screen.getByText("2 completed")).toBeInTheDocument();
    });

    it("shows empty state when no subjects", () => {
        mockUseQuery.mockReturnValue([]);
        render(<SubjectsPage />);
        expect(screen.getByText("No subjects yet")).toBeInTheDocument();
    });

    it("opens create dialog when clicking New Subject", async () => {
        const user = userEvent.setup();
        mockUseQuery.mockReturnValue([]);
        render(<SubjectsPage />);

        await user.click(screen.getByRole("button", { name: /new subject/i }));
        expect(screen.getByText("Create subject")).toBeInTheDocument();
        expect(screen.getByLabelText(/subject name/i)).toBeInTheDocument();
    });

    it("creates a new subject", async () => {
        const user = userEvent.setup();
        const createMock = jest.fn().mockResolvedValue("subject-id");
        mockUseQuery.mockReturnValue([]);
        mockUseMutation.mockReturnValue(createMock);

        render(<SubjectsPage />);

        await user.click(screen.getByRole("button", { name: /new subject/i }));
        await user.type(screen.getByLabelText(/subject name/i), "Physics");
        await user.click(screen.getByRole("button", { name: /^create$/i }));

        await waitFor(() => {
            expect(createMock).toHaveBeenCalledWith({ name: "Physics" });
        });
    });
});
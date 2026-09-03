import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/convex-mocks";
import { mockUseQuery } from "./__helpers__/convex-mocks";
import { makeNoteId, makeSubjectId } from "./__helpers__/convex-mocks";
import NotesPage from "@/app/notes/page";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
    usePathname: () => "/notes",
}));

describe("Search and filters", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const mockNotes = [
        {
            _id: makeNoteId("n1"),
            title: "Algebra basics",
            content: "Linear equations and inequalities",
            subjectId: makeSubjectId("s1"),
            status: "active" as const,
            updatedAt: Date.now(),
        },
        {
            _id: makeNoteId("n2"),
            title: "Geometry",
            content: "Triangles and circles",
            subjectId: makeSubjectId("s1"),
            status: "completed" as const,
            updatedAt: Date.now(),
        },
        {
            _id: makeNoteId("n3"),
            title: "Biology 101",
            content: "Cell structure",
            subjectId: makeSubjectId("s2"),
            status: "active" as const,
            updatedAt: Date.now(),
        },
    ];

    it("filters notes by search term with debounce", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:list") return [{ _id: makeSubjectId("s1"), name: "Math" }];
            if (name === "notes:list") return mockNotes;
            return [];
        });

        render(<NotesPage />);

        const searchInput = screen.getByPlaceholderText(/search notes/i);
        await user.type(searchInput, "algebra");

        jest.advanceTimersByTime(300);

        await waitFor(() => {
            expect(screen.getByText("Algebra basics")).toBeInTheDocument();
            expect(screen.queryByText("Geometry")).not.toBeInTheDocument();
            expect(screen.queryByText("Biology 101")).not.toBeInTheDocument();
        });
    });

    it("filters notes by status", async () => {
        const user = userEvent.setup();

        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:list") return [];
            if (name === "notes:list") return mockNotes;
            return [];
        });

        render(<NotesPage />);

        const statusSelect = screen.getByLabelText(/status/i);
        await user.selectOptions(statusSelect, "completed");

        await waitFor(() => {
            expect(screen.getByText("Geometry")).toBeInTheDocument();
            expect(screen.queryByText("Algebra basics")).not.toBeInTheDocument();
            expect(screen.queryByText("Biology 101")).not.toBeInTheDocument();
        });
    });

    it("combines search and status filters", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:list") return [];
            if (name === "notes:list") return mockNotes;
            return [];
        });

        render(<NotesPage />);

        const searchInput = screen.getByPlaceholderText(/search notes/i);
        await user.type(searchInput, "equations");
        jest.advanceTimersByTime(300);

        const statusSelect = screen.getByLabelText(/status/i);
        await user.selectOptions(statusSelect, "active");

        await waitFor(() => {
            expect(screen.getByText("Algebra basics")).toBeInTheDocument();
            expect(screen.queryByText("Geometry")).not.toBeInTheDocument();
            expect(screen.queryByText("Biology 101")).not.toBeInTheDocument();
        });
    });

    it("shows empty state when no results match filters", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:list") return [];
            if (name === "notes:list") return mockNotes;
            return [];
        });

        render(<NotesPage />);

        const searchInput = screen.getByPlaceholderText(/search notes/i);
        await user.type(searchInput, "nonexistent");
        jest.advanceTimersByTime(300);

        await waitFor(() => {
            expect(screen.getByText("No notes match your filters")).toBeInTheDocument();
        });
    });
});
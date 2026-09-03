import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/convex-mocks";
import { mockUseQuery } from "./__helpers__/convex-mocks";
import { makeNoteId, makeSubjectId } from "./__helpers__/convex-mocks";
import SubjectPage from "@/app/subjects/[id]/page";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

describe("SubjectPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const mockSubject = {
        _id: makeSubjectId("s1"),
        name: "Mathematics",
        createdAt: Date.now(),
    };

    const mockNotes = [
        {
            _id: makeNoteId("n1"),
            title: "Algebra",
            content: "Equations",
            subjectId: makeSubjectId("s1"),
            status: "active" as const,
            updatedAt: Date.now(),
        },
        {
            _id: makeNoteId("n2"),
            title: "Geometry",
            content: "Shapes",
            subjectId: makeSubjectId("s1"),
            status: "completed" as const,
            updatedAt: Date.now(),
        },
    ];

    it("shows loading state", () => {
        mockUseQuery.mockReturnValue(undefined);
        render(<SubjectPage params={{ id: "s1" }} />);
        expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    });

    it("renders subject with notes", () => {
        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:get") return mockSubject;
            if (name === "notes:list") return mockNotes;
            return [];
        });

        render(<SubjectPage params={{ id: "s1" }} />);

        expect(screen.getByText("Mathematics")).toBeInTheDocument();
        expect(screen.getByText("2 notes")).toBeInTheDocument();
        expect(screen.getByText("Algebra")).toBeInTheDocument();
        expect(screen.getByText("Geometry")).toBeInTheDocument();
    });

    it("filters notes within subject", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:get") return mockSubject;
            if (name === "notes:list") return mockNotes;
            return [];
        });

        render(<SubjectPage params={{ id: "s1" }} />);

        const searchInput = screen.getByPlaceholderText(/search notes/i);
        await user.type(searchInput, "algebra");
        jest.advanceTimersByTime(300);

        await waitFor(() => {
            expect(screen.getByText("Algebra")).toBeInTheDocument();
            expect(screen.queryByText("Geometry")).not.toBeInTheDocument();
        });
    });

    it("shows not found state", () => {
        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:get") return null;
            return [];
        });

        render(<SubjectPage params={{ id: "invalid" }} />);
        expect(screen.getByText("Subject not found")).toBeInTheDocument();
    });
});
import { render, screen } from "@testing-library/react";
import "./__helpers__/convex-mocks";
import { mockUseQuery } from "./__helpers__/convex-mocks";
import { makeNoteId, makeSubjectId } from "./__helpers__/convex-mocks";
import NotesPage from "@/app/notes/page";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
    usePathname: () => "/notes",
}));

describe("NotesPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading state when data is undefined", () => {
        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:list") return undefined;
            if (name === "notes:list") return undefined;
            return undefined;
        });

        render(<NotesPage />);
        expect(screen.getByText("Notes")).toBeInTheDocument();
        expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    });

    it("renders notes when data is loaded", () => {
        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:list") return [];
            if (name === "notes:list") {
                return [
                    {
                        _id: makeNoteId("n1"),
                        title: "Biology 101",
                        content: "Cell structure and function",
                        status: "active",
                        updatedAt: Date.now(),
                    },
                ];
            }
            return [];
        });

        render(<NotesPage />);
        expect(screen.getByText("Biology 101")).toBeInTheDocument();
        expect(screen.getByText(/Cell structure and function/)).toBeInTheDocument();
    });

    it("renders empty state when there are no notes", () => {
        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:list") return [];
            if (name === "notes:list") return [];
            return [];
        });

        render(<NotesPage />);
        expect(screen.getByText("No notes match your filters")).toBeInTheDocument();
    });

    it("shows subject names from the subjects list", () => {
        mockUseQuery.mockImplementation((name: string) => {
            if (name === "subjects:list") {
                return [{ _id: makeSubjectId("s1"), name: "Math", createdAt: 0 }];
            }
            if (name === "notes:list") {
                return [
                    {
                        _id: makeNoteId("n1"),
                        title: "Algebra",
                        content: "Equations",
                        subjectId: makeSubjectId("s1"),
                        status: "active",
                        updatedAt: Date.now(),
                    },
                ];
            }
            return [];
        });

        render(<NotesPage />);
        expect(screen.getByText("Math")).toBeInTheDocument();
    });
});
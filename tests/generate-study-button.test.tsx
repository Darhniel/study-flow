import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/convex-mocks";
import { mockUseQuery, mockUseMutation } from "./__helpers__/convex-mocks";
import { makeNoteId } from "./__helpers__/convex-mocks";
import { GenerateStudyButton } from "@/components/notes/generate-study-button";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

const originalFetch = global.fetch;

describe("GenerateStudyButton", () => {
    let saveMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        saveMock = jest.fn().mockResolvedValue("material-id");
        mockUseQuery.mockReturnValue(undefined); // no existing material
        mockUseMutation.mockReturnValue(saveMock);
        global.fetch = jest.fn();
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    const noteId = makeNoteId("n1");

    it("renders the generate button when no material exists", () => {
        render(
            <GenerateStudyButton noteId={noteId} title="T" content="C" />
        );
        expect(screen.getByRole("button", { name: /generate study material/i })).toBeInTheDocument();
    });

    it("renders existing study material when available", () => {
        mockUseQuery.mockReturnValue({
            summary: "Summary text",
            keyPoints: ["p1", "p2"],
            quizQuestions: [
                { question: "Q1?", answer: "A1" },
                { question: "Q2?", answer: "A2" },
                { question: "Q3?", answer: "A3" },
                { question: "Q4?", answer: "A4" },
                { question: "Q5?", answer: "A5" },
            ],
            createdAt: Date.now(),
        });

        render(
            <GenerateStudyButton noteId={noteId} title="T" content="C" />
        );

        expect(screen.getByText("Summary text")).toBeInTheDocument();
        expect(screen.getByText("p1")).toBeInTheDocument();
        expect(screen.getByText("Q1?")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /regenerate/i })).toBeInTheDocument();
    });

    it("calls the API and saves material on successful generation", async () => {
        const user = userEvent.setup();
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                ok: true,
                data: {
                    summary: "S",
                    keyPoints: ["k1"],
                    quizQuestions: [
                        { question: "Q1?", answer: "A1" },
                        { question: "Q2?", answer: "A2" },
                        { question: "Q3?", answer: "A3" },
                        { question: "Q4?", answer: "A4" },
                        { question: "Q5?", answer: "A5" },
                    ],
                },
            }),
        });

        render(
            <GenerateStudyButton noteId={noteId} title="Title" content="Content" />
        );

        await user.click(screen.getByRole("button", { name: /generate study material/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "/api/generate-study-material",
                expect.objectContaining({
                    method: "POST",
                    body: expect.stringContaining("Title"),
                })
            );
        });

        await waitFor(() => {
            expect(saveMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    noteId,
                    summary: "S",
                    keyPoints: ["k1"],
                })
            );
        });
    });

    it("shows rate-limit error message when API returns 429", async () => {
        const user = userEvent.setup();
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockResolvedValue({
            ok: false,
            json: async () => ({
                error: "Too many requests",
                code: "RATE_LIMIT",
            }),
        });

        render(
            <GenerateStudyButton noteId={noteId} title="T" content="C" />
        );

        await user.click(screen.getByRole("button", { name: /generate study material/i }));

        expect(
            await screen.findByText(/too many requests/i)
        ).toBeInTheDocument();
        expect(saveMock).not.toHaveBeenCalled();
    });

    it("does not call API when note has no content", async () => {
        const user = userEvent.setup();
        render(
            <GenerateStudyButton noteId={noteId} title="" content="" />
        );

        const button = screen.getByRole("button", { name: /generate study material/i });
        expect(button).toBeDisabled();
    });
});
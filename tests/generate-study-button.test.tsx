import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/convex-mocks";
import "./__helpers__/auth-mocks";
import { mockUseQuery, mockUseMutation, mockUseAction, makeNoteId } from "./__helpers__/convex-mocks";
import { GenerateStudyButton } from "@/components/notes/generate-study-button";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/",
}));

describe("GenerateStudyButton", () => {
  let saveMock: jest.Mock;
  let generateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    saveMock = jest.fn().mockResolvedValue("material-id");
    generateMock = jest.fn().mockResolvedValue({ ok: true });

    mockUseQuery.mockReturnValue(undefined); // no existing material
    mockUseMutation.mockReturnValue(saveMock);
    mockUseAction.mockReturnValue(generateMock);
  });

  const noteId = makeNoteId("n1");

  it("renders the generate button when no material exists", () => {
    render(<GenerateStudyButton noteId={noteId} title="T" content="C" />);
    expect(
      screen.getByRole("button", { name: /generate study material/i })
    ).toBeInTheDocument();
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

    render(<GenerateStudyButton noteId={noteId} title="T" content="C" />);

    expect(screen.getByText("Summary text")).toBeInTheDocument();
    expect(screen.getByText("p1")).toBeInTheDocument();
    expect(screen.getByText("Q1?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /regenerate/i })).toBeInTheDocument();
  });

  it("calls the action on successful generation", async () => {
    const user = userEvent.setup();
    render(<GenerateStudyButton noteId={noteId} title="Title" content="Content" />);

    await user.click(screen.getByRole("button", { name: /generate study material/i }));

    await waitFor(() => {
      expect(generateMock).toHaveBeenCalledWith({ noteId });
    });
  });

  it("shows rate-limit error message when action fails with rate limit", async () => {
    const user = userEvent.setup();
    generateMock.mockRejectedValue(new Error("rate limit exceeded"));

    render(<GenerateStudyButton noteId={noteId} title="T" content="C" />);

    await user.click(screen.getByRole("button", { name: /generate study material/i }));

    expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
  });

  it("shows config error when GEMINI_API_KEY is missing", async () => {
    const user = userEvent.setup();
    generateMock.mockRejectedValue(new Error("GEMINI_API_KEY is not configured"));

    render(<GenerateStudyButton noteId={noteId} title="T" content="C" />);

    await user.click(screen.getByRole("button", { name: /generate study material/i }));

    expect(await screen.findByText(/not configured/i)).toBeInTheDocument();
  });

  it("shows a try-again button after error", async () => {
    const user = userEvent.setup();
    generateMock.mockRejectedValue(new Error("API error"));

    render(<GenerateStudyButton noteId={noteId} title="T" content="C" />);

    await user.click(screen.getByRole("button", { name: /generate study material/i }));

    expect(await screen.findByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("displays AI disclaimer", () => {
    render(<GenerateStudyButton noteId={noteId} title="T" content="C" />);
    expect(screen.getByText(/ai-generated content may contain errors/i)).toBeInTheDocument();
  });
});
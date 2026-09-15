import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/convex-mocks";
import "./__helpers__/auth-mocks";
import { mockUseMutation, makeNoteId } from "./__helpers__/convex-mocks";
import { NoteCard } from "@/components/notes/note-card";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/notes",
}));

describe("NoteCard interactions", () => {
  let toggleMock: jest.Mock;
  let removeMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    toggleMock = jest.fn().mockResolvedValue(undefined);
    removeMock = jest.fn().mockResolvedValue(undefined);
    mockUseMutation.mockImplementation((name: string) => {
      if (name === "notes:toggleStatus") return toggleMock;
      if (name === "notes:remove") return removeMock;
      return jest.fn();
    });
  });

  const baseNote = {
    _id: makeNoteId("n1"),
    title: "Test note",
    content: "Some content",
    status: "active" as const,
    updatedAt: Date.now(),
  };

  it("toggles status when clicking the complete button", async () => {
    const user = userEvent.setup();
    render(<NoteCard note={baseNote} />);

    await user.click(screen.getByRole("button", { name: /complete/i }));
    await waitFor(() =>
      expect(toggleMock).toHaveBeenCalledWith({ id: makeNoteId("n1") })
    );
  });

  it("opens delete confirmation dialog when clicking delete", async () => {
    const user = userEvent.setup();
    render(<NoteCard note={baseNote} />);

    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(screen.getByText("Delete note?")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-delete")).toBeInTheDocument();
  });

  it("calls remove mutation when confirming delete", async () => {
    const user = userEvent.setup();
    render(<NoteCard note={baseNote} />);

    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await user.click(screen.getByTestId("confirm-delete"));

    await waitFor(() =>
      expect(removeMock).toHaveBeenCalledWith({ id: makeNoteId("n1") })
    );
  });

  it("does not call remove when canceling delete", async () => {
    const user = userEvent.setup();
    render(<NoteCard note={baseNote} />);

    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(removeMock).not.toHaveBeenCalled();
  });

  it("shows 'Mark active' when note is completed", () => {
    render(<NoteCard note={{ ...baseNote, status: "completed" }} />);
    expect(screen.getByRole("button", { name: /mark active/i })).toBeInTheDocument();
  });

  it("shows 'Complete' when note is active", () => {
    render(<NoteCard note={baseNote} />);
    expect(screen.getByRole("button", { name: /^complete$/i })).toBeInTheDocument();
  });

  it("truncates long content preview", () => {
    const longContent = "x".repeat(200);
    render(<NoteCard note={{ ...baseNote, content: longContent }} />);
    // The preview should end with an ellipsis
    const preview = screen.getByText(/x+…/);
    expect(preview).toBeInTheDocument();
  });

  it("links to the note detail page", () => {
    render(<NoteCard note={baseNote} />);
    const link = screen.getByRole("link", { name: "Test note" });
    expect(link).toHaveAttribute("href", "/notes/n1");
  });
});
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/convex-mocks";
import "./__helpers__/auth-mocks";
import { mockUseMutation, makeSubjectId, makeStorageId } from "./__helpers__/convex-mocks";
import { NoteForm } from "@/components/notes/note-form";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), refresh: mockRefresh }),
  usePathname: () => "/",
}));

describe("NoteForm", () => {
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let uploadUrlMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    createMock = jest.fn().mockResolvedValue("note-id");
    updateMock = jest.fn().mockResolvedValue(undefined);
    uploadUrlMock = jest.fn().mockResolvedValue("https://upload.convex.dev/url");

    mockUseMutation.mockImplementation((name: string) => {
      if (name === "notes:create") return createMock;
      if (name === "notes:update") return updateMock;
      if (name === "uploads:generateUploadUrl") return uploadUrlMock;
      return jest.fn();
    });

    // Mock fetch for file upload
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ storageId: makeStorageId("storage-1") }),
    }) as jest.Mock;
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(<NoteForm subjects={[]} />);

    await user.click(screen.getByRole("button", { name: /create note/i }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText(/content or an attachment is required/i)).toBeInTheDocument();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates note with text content only", async () => {
    const user = userEvent.setup();
    render(<NoteForm subjects={[]} />);

    await user.type(screen.getByLabelText(/title/i), "Biology 101");
    await user.type(screen.getByLabelText(/content/i), "Cell structure");
    await user.click(screen.getByRole("button", { name: /create note/i }));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith({
        title: "Biology 101",
        content: "Cell structure",
        subjectId: undefined,
        attachmentId: undefined,
        attachmentName: undefined,
        attachmentType: undefined,
      })
    );
    expect(mockPush).toHaveBeenCalledWith("/notes");
  });

  it("creates note with subject selected", async () => {
    const user = userEvent.setup();
    const subjects = [{ _id: makeSubjectId("s1"), name: "Math" }];
    render(<NoteForm subjects={subjects} />);

    await user.type(screen.getByLabelText(/title/i), "Algebra");
    await user.type(screen.getByLabelText(/content/i), "Equations");
    await user.selectOptions(screen.getByLabelText(/subject/i), "s1");
    await user.click(screen.getByRole("button", { name: /create note/i }));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          subjectId: makeSubjectId("s1"),
        })
      )
    );
  });

  it("pre-fills fields when editing an existing note", () => {
    render(
      <NoteForm
        subjects={[]}
        initial={{
          id: "n1" as never,
          title: "Existing",
          content: "Body",
        }}
      />
    );

    expect(screen.getByLabelText(/title/i)).toHaveValue("Existing");
    expect(screen.getByLabelText(/content/i)).toHaveValue("Body");
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("allows note creation with only an attachment", async () => {
    const user = userEvent.setup();
    render(<NoteForm subjects={[]} />);

    await user.type(screen.getByLabelText(/title/i), "Photo note");

    const file = new File(["image data"], "notes.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/attachment/i);
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /create note/i }));

    await waitFor(() => {
      expect(uploadUrlMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Photo note",
          content: "",
          attachmentId: makeStorageId("storage-1"),
          attachmentName: "notes.png",
          attachmentType: "image/png",
        })
      );
    });
  });

  it("shows existing attachment when editing", () => {
    render(
      <NoteForm
        subjects={[]}
        initial={{
          id: "n1" as never,
          title: "T",
          content: "C",
          attachmentId: makeStorageId("s1"),
          attachmentName: "existing.pdf",
          attachmentType: "application/pdf",
        }}
      />
    );

    expect(screen.getByText(/current file: existing.pdf/i)).toBeInTheDocument();
  });

  it("shows remove option for existing attachment", async () => {
    const user = userEvent.setup();
    render(
      <NoteForm
        subjects={[]}
        initial={{
          id: "n1" as never,
          title: "T",
          content: "C",
          attachmentId: makeStorageId("s1"),
          attachmentName: "existing.pdf",
          attachmentType: "application/pdf",
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: /remove/i }));
    expect(screen.getByText(/attachment will be removed on save/i)).toBeInTheDocument();
  });

  it("accepts only image and PDF files", () => {
    render(<NoteForm subjects={[]} />);
    const fileInput = screen.getByLabelText(/attachment/i) as HTMLInputElement;
    expect(fileInput.accept).toBe(
      "image/png, image/jpeg, image/jpg, application/pdf"
    );
  });
});
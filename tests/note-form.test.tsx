import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/convex-mocks";
import { mockUseMutation } from "./__helpers__/convex-mocks";
import { makeSubjectId } from "./__helpers__/convex-mocks";
import { NoteForm } from "@/components/notes/note-form";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

describe("NoteForm", () => {
    let createMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        createMock = jest.fn().mockResolvedValue("note-id");
        mockUseMutation.mockReturnValue(createMock);
    });

    it("shows validation errors when submitting empty form", async () => {
        const user = userEvent.setup();
        render(<NoteForm subjects={[]} />);

        await user.click(screen.getByRole("button", { name: /create note/i }));

        expect(await screen.findByText("Title is required")).toBeInTheDocument();
        expect(screen.getByText("Content is required")).toBeInTheDocument();
        expect(createMock).not.toHaveBeenCalled();
    });

    it("calls create mutation with form data on valid submit", async () => {
        const user = userEvent.setup();
        const subjects = [{ _id: makeSubjectId("s1"), name: "Math" }];
        render(<NoteForm subjects={subjects} />);

        await user.type(screen.getByLabelText(/title/i), "Biology 101");
        await user.type(screen.getByLabelText(/content/i), "Cell structure");
        await user.selectOptions(screen.getByLabelText(/subject/i), "s1");
        await user.click(screen.getByRole("button", { name: /create note/i }));

        await waitFor(() =>
            expect(createMock).toHaveBeenCalledWith({
                title: "Biology 101",
                content: "Cell structure",
                subjectId: makeSubjectId("s1"),
            })
        );
        expect(mockPush).toHaveBeenCalledWith("/notes");
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
});
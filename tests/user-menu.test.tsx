import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/auth-mocks";
import { mockUseQuery } from "./__helpers__/convex-mocks";
import { mockUseAuthActions } from "./__helpers__/auth-mocks";
import { UserMenu } from "@/components/auth/user-menu";

describe("UserMenu", () => {
    let signOutMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        signOutMock = jest.fn();
        mockUseAuthActions.mockReturnValue({ signOut: signOutMock });
    });

    it("renders nothing when user is not loaded", () => {
        mockUseQuery.mockReturnValue(undefined);
        const { container } = render(<UserMenu />);
        expect(container.firstChild).toBeNull();
    });

    it("renders user email when user is loaded", () => {
        mockUseQuery.mockReturnValue({ email: "test@example.com", name: "Test User" });
        render(<UserMenu />);
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("opens menu when button is clicked", async () => {
        const user = userEvent.setup();
        mockUseQuery.mockReturnValue({ email: "test@example.com" });
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));
        expect(screen.getByRole("menu")).toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: /sign out/i })).toBeInTheDocument();
    });

    it("calls signOut when sign out is clicked", async () => {
        const user = userEvent.setup();
        mockUseQuery.mockReturnValue({ email: "test@example.com" });
        render(<UserMenu />);

        await user.click(screen.getByRole("button"));
        await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

        expect(signOutMock).toHaveBeenCalled();
    });
});
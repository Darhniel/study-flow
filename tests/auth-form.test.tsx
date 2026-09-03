import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/auth-mocks";
import { mockUseAuthActions } from "./__helpers__/auth-mocks";
import { AuthForm } from "@/components/auth/auth-form";

describe("AuthForm", () => {
    let signInMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        signInMock = jest.fn().mockResolvedValue({ redirect: true });
        mockUseAuthActions.mockReturnValue({ signIn: signInMock });
    });

    it("renders sign in form", () => {
        render(<AuthForm mode="signIn" />);
        expect(screen.getByText("Sign in")).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    });

    it("renders sign up form with name field", () => {
        render(<AuthForm mode="signUp" />);
        expect(screen.getByText("Create account")).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it("calls signIn with correct parameters on sign in", async () => {
        const user = userEvent.setup();
        render(<AuthForm mode="signIn" />);

        await user.type(screen.getByLabelText(/email/i), "test@example.com");
        await user.type(screen.getByLabelText(/password/i), "password123");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(signInMock).toHaveBeenCalledWith("password", {
                email: "test@example.com",
                password: "password123",
                flow: "signIn",
            });
        });
    });

    it("calls signIn with name on sign up", async () => {
        const user = userEvent.setup();
        render(<AuthForm mode="signUp" />);

        await user.type(screen.getByLabelText(/name/i), "John Doe");
        await user.type(screen.getByLabelText(/email/i), "john@example.com");
        await user.type(screen.getByLabelText(/password/i), "password123");
        await user.click(screen.getByRole("button", { name: /create account/i }));

        await waitFor(() => {
            expect(signInMock).toHaveBeenCalledWith("password", {
                email: "john@example.com",
                password: "password123",
                name: "John Doe",
                flow: "signUp",
            });
        });
    });

    it("shows error message on authentication failure", async () => {
        const user = userEvent.setup();
        signInMock.mockRejectedValue(new Error("Invalid credentials"));
        render(<AuthForm mode="signIn" />);

        await user.type(screen.getByLabelText(/email/i), "test@example.com");
        await user.type(screen.getByLabelText(/password/i), "wrong");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    });
});
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./__helpers__/convex-mocks";
import "./__helpers__/auth-mocks";
import { mockUseAuthActions } from "./__helpers__/auth-mocks";
import { AuthForm } from "@/components/auth/auth-form";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}));

describe("AuthForm", () => {
  let signInMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    signInMock = jest.fn().mockResolvedValue({ redirect: true });
    mockUseAuthActions.mockReturnValue({ signIn: signInMock });
  });

  afterEach(() => {
    // Restores any jest.spyOn mocks created in tests (e.g. console.error below)
    jest.restoreAllMocks();
  });

  it("renders sign in form without name field", () => {
    render(<AuthForm mode="signIn" />);
    expect(screen.getAllByText("Sign in").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
  });

  it("renders sign up form with name field", () => {
    render(<AuthForm mode="signUp" />);
    expect(screen.getAllByText("Create account").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("calls signIn with correct params on sign in", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signIn" />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith("password", {
        email: "test@example.com",
        password: "password123",
        flow: "signIn",
      })
    );
  });

  it("includes name on sign up", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signUp" />);

    await user.type(screen.getByLabelText(/^name$/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith("password", {
        email: "john@example.com",
        password: "password123",
        name: "John Doe",
        flow: "signUp",
      })
    );
  });

  it("shows error message on auth failure", async () => {
    // AuthForm intentionally logs auth failures via console.error; silence it
    // for the test output and assert the log instead.
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    signInMock.mockRejectedValue(new Error("Invalid credentials"));
    render(<AuthForm mode="signIn" />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Authentication Error: ",
      expect.any(Error)
    );
  });

  it("links to sign up from sign in form", () => {
    render(<AuthForm mode="signIn" />);
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/signup");
  });

  it("links to sign in from sign up form", () => {
    render(<AuthForm mode="signUp" />);
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });
});
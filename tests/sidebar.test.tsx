import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "@/components/layout/app-shell";

jest.mock("next/navigation", () => ({
    usePathname: () => "/",
}));

describe("Sidebar", () => {
    it("renders desktop sidebar by default", () => {
        render(
            <AppShell>
                <div>Content</div>
            </AppShell>
        );

        expect(screen.getByText("StudyFlow")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Notes")).toBeInTheDocument();
    });

    it("opens mobile sidebar when menu button is clicked", async () => {
        const user = userEvent.setup();

        // Mock window.innerWidth to simulate mobile
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 375,
        });

        render(
            <AppShell>
                <div>Content</div>
            </AppShell>
        );

        const menuButton = screen.getByLabelText("Open menu");
        await user.click(menuButton);

        // Sidebar should now be visible
        expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    });

    it("closes mobile sidebar when close button is clicked", async () => {
        const user = userEvent.setup();

        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 375,
        });

        render(
            <AppShell>
                <div>Content</div>
            </AppShell>
        );

        // Open sidebar
        await user.click(screen.getByLabelText("Open menu"));
        expect(screen.getByLabelText("Close menu")).toBeInTheDocument();

        // Close sidebar
        await user.click(screen.getByLabelText("Close menu"));
        expect(screen.queryByLabelText("Close menu")).not.toBeInTheDocument();
    });

    it("closes mobile sidebar when backdrop is clicked", async () => {
        const user = userEvent.setup();

        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 375,
        });

        render(
            <AppShell>
                <div>Content</div>
            </AppShell>
        );

        // Open sidebar
        await user.click(screen.getByLabelText("Open menu"));

        // Click backdrop (the overlay div)
        const backdrop = document.querySelector(".bg-black\\/50");
        if (backdrop) {
            await user.click(backdrop);
        }

        expect(screen.queryByLabelText("Close menu")).not.toBeInTheDocument();
    });
});
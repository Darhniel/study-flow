import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/layout/app-shell";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    usePathname: () => "/",
}));

// Mock framer-motion to avoid animation issues in jsdom
jest.mock("framer-motion", () => {
    const React = require("react");
    const motionProxy = new Proxy(
        {},
        {
            get: (_target, prop: string) => {
                return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
                    const { initial, animate, exit, whileHover, whileTap, variants, ...rest } =
                        props as Record<string, unknown>;
                    void initial; void animate; void exit; void whileHover; void whileTap; void variants;
                    return React.createElement(prop as string, { ...rest, ref });
                });
            },
        }
    );
    return {
        __esModule: true,
        motion: motionProxy,
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    };
});

describe("AppShell", () => {
    it("renders the StudyFlow logo and main content", () => {
        render(
            <AppShell>
                <div data-testid="child">Hello StudyFlow</div>
            </AppShell>
        );

        expect(screen.getByText("StudyFlow")).toBeInTheDocument();
        expect(screen.getByTestId("child")).toHaveTextContent("Hello StudyFlow");
    });

    it("renders all navigation items on desktop sidebar", () => {
        render(
            <AppShell>
                <span>content</span>
            </AppShell>
        );

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Notes")).toBeInTheDocument();
        expect(screen.getByText("Subjects")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
    });
});
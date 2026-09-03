import type { Id } from "@/convex/_generated/dataModel";

export function makeNoteId(id: string): Id<"notes"> {
    return id as Id<"notes">;
}

export function makeSubjectId(id: string): Id<"subjects"> {
    return id as Id<"subjects">;
}

export const mockUseQuery = jest.fn();
export const mockUseMutation = jest.fn();

jest.mock("convex/react", () => ({
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
    useMutation: (...args: unknown[]) => mockUseMutation(...args),
    ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
    ConvexReactClient: jest.fn(),
}));

jest.mock("@/convex/_generated/api", () => ({
    api: {
        notes: {
            list: "notes:list",
            listRecent: "notes:listRecent",
            get: "notes:get",
            create: "notes:create",
            update: "notes:update",
            remove: "notes:remove",
            toggleStatus: "notes:toggleStatus",
            count: "notes:count",
            countByStatus: "notes:countByStatus",
            search: "notes:search",
        },
        subjects: {
            list: "subjects:list",
            get: "subjects:get",
            create: "subjects:create",
            rename: "subjects:rename",
            remove: "subjects:remove",
            count: "subjects:count",
        },
    },
}));
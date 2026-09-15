import type { Id } from "@/convex/_generated/dataModel";
import { mockUseConvexAuth } from "./auth-mocks";

export function makeNoteId(id: string): Id<"notes"> {
    return id as Id<"notes">;
}

export function makeSubjectId(id: string): Id<"subjects"> {
    return id as Id<"subjects">;
}

export function makeUserId(id: string): Id<"users"> {
    return id as Id<"users">;
}

export function makeStorageId(id: string): Id<"_storage"> {
    return id as Id<"_storage">;
}

export const mockUseQuery = jest.fn();
export const mockUseMutation = jest.fn();
export const mockUseAction = jest.fn();

jest.mock("convex/react", () => ({
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
    useMutation: (...args: unknown[]) => mockUseMutation(...args),
    useAction: (...args: unknown[]) => mockUseAction(...args),
    useConvexAuth: () => mockUseConvexAuth(),
    ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
    ConvexReactClient: jest.fn(),
}));

jest.mock("@/convex/_generated/api", () => ({
    api: {
        notes: {
            list: "notes:list",
            listRecent: "notes:listRecent",
            listRecentlyUpdated: "notes:listRecentlyUpdated",
            listWithStudyMaterial: "notes:listWithStudyMaterial",
            get: "notes:get",
            getAttachmentUrl: "notes:getAttachmentUrl",
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
            listWithStats: "subjects:listWithStats",
            create: "subjects:create",
            rename: "subjects:rename",
            remove: "subjects:remove",
            count: "subjects:count",
        },
        studyMaterials: {
            getByNote: "studyMaterials:getByNote",
            save: "studyMaterials:save",
            remove: "studyMaterials:remove",
        },
        users: {
            viewer: "users:viewer",
        },
        uploads: {
            generateUploadUrl: "uploads:generateUploadUrl",
        },
        generateStudyMaterials: {
            generate: "generateStudyMaterials:generate",
        },
    },
}));
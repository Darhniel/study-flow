export const mockUseConvexAuth = jest.fn();
export const mockUseAuthActions = jest.fn();

jest.mock("convex/react", () => ({
  useConvexAuth: () => mockUseConvexAuth(),
  useQuery: jest.requireActual("./convex-mocks").mockUseQuery,
  useMutation: jest.requireActual("./convex-mocks").mockUseMutation,
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => mockUseAuthActions(),
}));

jest.mock("@convex-dev/auth/nextjs", () => ({
  ConvexAuthNextjsProvider: ({ children }: { children: React.ReactNode }) => children,
}));
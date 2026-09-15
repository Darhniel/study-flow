export const mockUseConvexAuth = jest.fn();
export const mockUseAuthActions = jest.fn();

mockUseAuthActions.mockReturnValue({ signIn: jest.fn(), signOut: jest.fn() });
mockUseConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: false });

// jest.mock("convex/react", () => ({
//   useConvexAuth: () => mockUseConvexAuth(),
//   useQuery: jest.requireActual("./convex-mocks").mockUseQuery,
//   useMutation: jest.requireActual("./convex-mocks").mockUseMutation,
//   ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
// }));

jest.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => mockUseAuthActions(),
  useConvexAuth: () => mockUseConvexAuth(),
}));

jest.mock("@convex-dev/auth/nextjs", () => ({
  ConvexAuthNextjsProvider: ({ children }: { children: React.ReactNode }) => children,
}));
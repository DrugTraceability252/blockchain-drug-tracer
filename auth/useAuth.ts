export function useAuth() {
  return {
    user: {
      name: "Nguyen Van A",
      role: "REGULATOR" as const,
    },
  };
}
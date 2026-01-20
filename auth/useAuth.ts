export function useAuth() {
  return {
    user: {
      name: "Nguyen Van A",
      role: "MANUFACTURER" as const,
    },
  };
}
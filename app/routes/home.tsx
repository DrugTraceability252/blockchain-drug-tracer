import { useAuth } from "auth/useAuth";
import type { Route } from "./+types/home";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { isLogin } = useAuth();
  return <div>{isLogin ? "Home" : "Not logged in"}</div>;
}

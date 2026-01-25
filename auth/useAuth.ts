import Keycloak  from "keycloak-js";
import { useEffect, useState, useRef } from "react";

const client = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT
    });

export function useAuth() {
  const isRun = useRef(false);
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;
    // Check if user is logged in
    client.init({
      onLoad: "login-required",
    }).then((authenticated) => {
      setIsLogin(authenticated);
    });
  }, []);

  return {
    user: {
      name: "Nguyen Van A",
      role: "MANUFACTURER" as const,
    },
    isLogin,
  };
}
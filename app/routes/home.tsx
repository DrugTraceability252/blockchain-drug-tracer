import { Button, Flex, Spin, Typography, message } from "antd";
import type { Route } from "./+types/home";
import { useNavigate } from "react-router";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import { userApi } from "api/userApi";

const { Title } = Typography;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Traceability System" },
    { name: "description", content: "Welcome to Traceability System!" },
  ];
}

export default function Home() {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      if (initialized && keycloak.authenticated && keycloak.token) {
        setIsRedirecting(true);

        try {
          const userId = keycloak.tokenParsed?.sub; 
          
          if (!userId) {
              throw new Error("Không tìm thấy User ID trong Token!");
          }

          const userData = await userApi.getUserById(userId, keycloak.token);
          
          console.log("👤 Dữ liệu User từ API:", userData);

          const userGroups = userData.attributes?.group || [];
          const groupStr = userGroups.join(" ").toUpperCase(); 

          console.log("🔑 Phân quyền tìm thấy:", groupStr);

          if (groupStr.includes("MANUFACTURER")) {
            navigate("/manufacturer/dashboard", { replace: true });
          } else if (groupStr.includes("DISTRIBUTOR")) {
            navigate("/distributor/dashboard", { replace: true });
          } else if (groupStr.includes("REGULATOR")) {
            navigate("/regulator/dashboard", { replace: true });
          } else if (groupStr.includes("PHARMACY")) {
            navigate("/pharmacy/dashboard", { replace: true });
          } else {
            console.warn("⚠️ API không chứa Group hợp lệ!", userData);
            message.warning("Tài khoản của bạn chưa được gán Nhóm (Group) hợp lệ!");
            setIsRedirecting(false);
          }

        } catch (error) {
          console.error("Lỗi khi điều hướng:", error);
          message.error("Lỗi kết nối máy chủ khi lấy thông tin quyền!");
          setIsRedirecting(false);
        }
      }
    };

    fetchUserAndRedirect();
  }, [initialized, keycloak.authenticated, navigate, keycloak.token, keycloak.tokenParsed]);

  if (!initialized || isRedirecting) {
    return (
      <Flex justify="center" align="center" style={{ height: "100vh" }}>
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." fullscreen />
      </Flex>
    );
  }

  return (
    <Flex justify="center" align="center" vertical gap="large" style={{ height: '100vh' }}>
      <div>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Hệ thống truy xuất nguồn gốc thuốc
        </Title>
        <Flex justify="center">
          <Button type="primary" size="large" onClick={() => keycloak.login()}>
            Đăng nhập vào Hệ thống
          </Button>
        </Flex>
      </div>
    </Flex>
  );
}
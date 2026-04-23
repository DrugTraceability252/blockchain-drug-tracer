import { Button, Card, Col, Flex, Row, Typography } from "antd";
import type { Route } from "./+types/home";
import { BuildOutlined, CarOutlined, ShopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect } from "react";

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

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      const roles = keycloak.tokenParsed?.realm_access?.roles || [];

      if (roles.includes("MANUFACTURER")) {
        navigate("/manufacturer/dashboard");
      } else if (roles.includes("DISTRIBUTOR")) {
        navigate("/distributor/dashboard");
      } else if (roles.includes("REGULATOR")) {
        navigate("/regulator/dashboard");
      } else if (roles.includes("PHARMACY")) {
        navigate("/pharmacy/dashboard");
      }
    }
  }, [initialized, keycloak.authenticated, navigate, keycloak.tokenParsed]);

  if (!initialized) return <div>Đang tải Keycloak...</div>;

  return (
    <Flex justify="center" align="center" vertical gap="large" style={{ height: '100vh' }}>
      
      <div>
        {!keycloak.authenticated ? (
            <Button type="primary" size="large" onClick={() => keycloak.login()}>
                Đăng nhập vào Hệ thống
            </Button>
        ) : (
            <Button danger onClick={() => keycloak.logout()}>
                Đăng xuất ({keycloak.tokenParsed?.preferred_username})
            </Button>
        )}
      </div>

      {keycloak.authenticated && (
        <Row gutter={32}>
          <Col>
            <Card
              hoverable
              style={{ width: 220, textAlign: "center", borderRadius: 12 }}
              onClick={() => navigate("/manufacturer/dashboard")}
            >
              <BuildOutlined style={{ fontSize: 48, margin: 12 }} />
              <Title level={4}>Manufacturer</Title>
            </Card>
          </Col>

          <Col>
            <Card
              hoverable
              style={{ width: 220, textAlign: "center", borderRadius: 12 }}
              onClick={() => navigate("/distributor/dashboard")}
            >
              <CarOutlined style={{ fontSize: 48, margin: 12 }} />
              <Title level={4}>Distributor</Title>
            </Card>
          </Col>

          <Col>
            <Card
              hoverable
              style={{ width: 220, textAlign: "center", borderRadius: 12 }}
              onClick={() => navigate("/regulator/dashboard")}
            >
              <ShopOutlined style={{ fontSize: 48, margin: 12 }} />
              <Title level={4}>Regulator</Title>
            </Card>
          </Col>
        </Row>
      )}
    </Flex>
  );
}
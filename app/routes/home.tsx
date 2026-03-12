import { Card, Col, Flex, Row, Typography } from "antd";
import type { Route } from "./+types/home";
import { BuildOutlined, CarOutlined, ShopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

const { Title } = Typography;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  return (
    <Flex justify="center" align="center">
      <Row gutter={32}>
        <Col>
          <Card
            hoverable
            style={{
              width: 220,
              textAlign: "center",
              borderRadius: 12,
            }}
            onClick={() => navigate("/manufacturer/dashboard")}
          >
            <BuildOutlined style={{ fontSize: 48, margin: 12 }} />
            <Title level={4}>Manufacturer</Title>
          </Card>
        </Col>

        <Col>
          <Card
            hoverable
            style={{
              width: 220,
              textAlign: "center",
              borderRadius: 12,
            }}
            onClick={() => navigate("/distributor/dashboard")}
          >
            <CarOutlined style={{ fontSize: 48, margin: 12 }} />
            <Title level={4}>Distributor</Title>
          </Card>
        </Col>

        <Col>
          <Card
            hoverable
            style={{
              width: 220,
              textAlign: "center",
              borderRadius: 12,
            }}
            onClick={() => navigate("/regulator/dashboard")}
          >
            <ShopOutlined style={{ fontSize: 48, margin: 12 }} />
            <Title level={4}>Regulator</Title>
          </Card>
        </Col>
      </Row>
    </Flex>
  );
}

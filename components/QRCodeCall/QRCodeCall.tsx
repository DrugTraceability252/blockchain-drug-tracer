import { useState } from "react";
import { Button, Image, Tag } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";

export const QRCodeCell = ({ batchId, boxId, baseUrl }: { batchId: string, boxId: string, baseUrl: string }) => {
    const [showQR, setShowQR] = useState(false);

    if (!showQR) {
        return (
            <Button 
                type="dashed" 
                icon={<QrcodeOutlined />} 
                onClick={() => setShowQR(true)}
            >
                Xem QR
            </Button>
        );
    }

    const objectPath = `qrcode/${batchId}/${boxId}.jpg`;
    return (
        <Image
            width={80}
            height={80}
            src={`${baseUrl}/files/preview?objectName=${objectPath}`}
            fallback="https://via.placeholder.com/80?text=No+QR"
            preview={true}
        />
    );
};
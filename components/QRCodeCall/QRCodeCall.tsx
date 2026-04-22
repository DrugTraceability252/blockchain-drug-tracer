import { useState } from "react";
import { Button, Image } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";

export const QRCodeCell = ({
    batchId,
    boxId,
    baseUrl
}: {
    batchId: string;
    boxId: string;
    baseUrl: string;
}) => {
    const [previewOpen, setPreviewOpen] = useState(false);

    const objectPath = `qrcode/${batchId}/${boxId}.jpg`;
    const src = `${baseUrl}/files/preview?objectName=${objectPath}`;

    return (
        <>
            <Button
                type="dashed"
                icon={<QrcodeOutlined />}
                onClick={() => setPreviewOpen(true)}
            >
                Xem QR
            </Button>

            <Image
                src={src}
                style={{ display: "none" }}
                preview={{
                    visible: previewOpen,
                    onVisibleChange: (vis) => setPreviewOpen(vis),
                }}
            />
        </>
    );
};
export const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            padding: "2px 16px",
        }}
    >
        <span style={{ color: "#555" }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
);
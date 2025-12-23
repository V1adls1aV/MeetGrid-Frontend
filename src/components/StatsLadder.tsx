import React from "react";
import { Card, Space } from "antd";

interface Block {
  key: string;
  label: string;
  range: string;
}

interface Props {
  blocks: Block[];
}

const StatsLadder: React.FC<Props> = ({ blocks }) => (
  <Space direction="vertical" style={{ width: "100%" }}>
    {blocks.map((block) => (
      <Card key={block.key} size="small">
        <div>
          <strong>{block.label}</strong>
        </div>
        <div>{block.range}</div>
      </Card>
    ))}
  </Space>
);

export default StatsLadder;

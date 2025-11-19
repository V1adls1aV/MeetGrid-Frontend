// Purpose: визуализирует лестницу статистики с блоками из бэкенда.
import React from 'react';
import { Card, Space } from 'antd';

interface Block {
  label: string;
  range: string;
}

interface Props {
  blocks: Block[];
}

const StatsLadder: React.FC<Props> = ({ blocks }) => (
  <Space direction="vertical" style={{ width: '100%' }}>
    {blocks.map((block) => (
      <Card key={block.label} size="small">
        <div>
          <strong>{block.label}</strong>
        </div>
        <div>{block.range}</div>
      </Card>
    ))}
  </Space>
);

export default StatsLadder;

import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Typography } from 'antd';
import StatsLadder from '../components/StatsLadder';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTopicThunk } from '../store/topicSlice';

const { Title, Paragraph } = Typography;

const formatTimeRange = (start: string, end: string) =>
  `${new Date(start).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} — ${new Date(
    end
  ).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

const buildBlocks = (label: string, intervals: { start: string; end: string; people_min: number; people_max: number }[]) =>
  intervals.map((interval, index) => ({
    key: `${label}-${index}-${interval.start}`,
    label: `${interval.people_min}-${interval.people_max} ${label}`,
    range: formatTimeRange(interval.start, interval.end),
  }));

const TopicAdminPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const dispatch = useAppDispatch();
  const { topic, stats, loading, error } = useAppSelector((state) => state.topic);

  useEffect(() => {
    if (topicId) {
      dispatch(fetchTopicThunk({ topicId }));
    }
  }, [dispatch, topicId]);

  const ladderBlocks = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [...buildBlocks('— 90%', stats.blocks_90), ...buildBlocks('— 70%', stats.blocks_70)];
  }, [stats]);

  return (
    <section style={{ padding: '2rem' }}>
      <Title level={2}>Администрирование</Title>
      {loading && <Paragraph>Загрузка...</Paragraph>}
      {error && <Alert message="Ошибка" description={error} type="error" showIcon />}
      {topic && (
        <Paragraph>
          Тема: <strong>{topic.topic_name}</strong> <br />
          Админ: {topic.admin_name}
        </Paragraph>
      )}
      <Paragraph>Статистика ограничения: отображается топ-2 блока.</Paragraph>
      <StatsLadder blocks={ladderBlocks} />
    </section>
  );
};

export default TopicAdminPage;

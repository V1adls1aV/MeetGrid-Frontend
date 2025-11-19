import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Alert, Button, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTopicThunk } from '../store/topicSlice';
import { setUsername } from '../store/userSlice';
import UsernameModal from '../components/UsernameModal';
import StatsLadder from '../components/StatsLadder';
import { StatsInterval } from '../types/topic';
import { useLocalStorage } from '../hooks/useLocalStorage';

const { Title } = Typography;

const formatTimeRange = (start: string, end: string) => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  return `${new Date(start).toLocaleTimeString('ru-RU', options)} — ${new Date(end).toLocaleTimeString(
    'ru-RU',
    options
  )}`;
};

const mapBlocks = (label: string, intervals: StatsInterval[]) =>
  intervals.map((interval, index) => ({
    label: `${interval.people_min}-${interval.people_max} участников ${label}`,
    range: formatTimeRange(interval.start, interval.end),
    key: `${label}-${index}-${interval.start}`,
  }));

const TopicMainPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.user.username);
  const { stats, loading, error } = useAppSelector((state) => state.topic);
  const [storedName, setStoredName] = useLocalStorage('meetgrid-username', '');

  useEffect(() => {
    if (storedName && storedName !== username) {
      dispatch(setUsername(storedName));
    }
  }, [storedName, username, dispatch]);

  useEffect(() => {
    if (!topicId || !username) {
      return;
    }

    dispatch(fetchTopicThunk({ topicId, username }));
  }, [dispatch, topicId, username]);

  const blocks = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      ...mapBlocks('— 90%', stats.blocks_90),
      ...mapBlocks('— 70%', stats.blocks_70),
      ...mapBlocks('— 50%', stats.blocks_50),
    ];
  }, [stats]);

  const handleConfirm = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    setStoredName(trimmed);
    dispatch(setUsername(trimmed));
  };

  const refresh = () => {
    if (topicId && username) {
      dispatch(fetchTopicThunk({ topicId, username }));
    }
  };

  return (
    <section style={{ padding: '2rem' }}>
      <Title level={2}>Опрос</Title>
      <Button type="link" onClick={refresh} disabled={!username || !topicId}>
        Обновить статистику
      </Button>
      {loading && (
        <div style={{ margin: '1rem 0' }}>
          <Spin />
        </div>
      )}
      {error && (
        <Alert
          message="Не удалось загрузить данные"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '1rem' }}
        />
      )}
      <StatsLadder blocks={blocks} />
      <UsernameModal
        visible={!username}
        onConfirm={handleConfirm}
        onCancel={() => {
          // keep modal open until a name is entered
        }}
      />
    </section>
  );
};

export default TopicMainPage;

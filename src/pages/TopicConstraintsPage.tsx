// Purpose: позволяет админу добавить интервалы ограничений перед созданием темы.
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button, DatePicker, Typography } from 'antd';
import ConstraintsCalendar, { ConstraintEvent } from '../components/ConstraintsCalendar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setDraftConstraints } from '../store/topicSlice';
import { Interval } from '../types/topic';

const { Title, Paragraph } = Typography;

const eventToInterval = (event: ConstraintEvent): Interval => ({
  start: event.start.toISOString(),
  end: event.end.toISOString(),
});

const intervalToEvent = (interval: Interval): ConstraintEvent => ({
  id: `${interval.start}-${interval.end}`,
  title: 'Окно',
  start: new Date(interval.start),
  end: new Date(interval.end),
});

const TopicConstraintsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const draftConstraints = useAppSelector((state) => state.topic.draftConstraints);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const events = useMemo(() => draftConstraints.map(intervalToEvent), [draftConstraints]);

  const handleChange = useCallback(
    (nextEvents: ConstraintEvent[]) => {
      dispatch(setDraftConstraints(nextEvents.map(eventToInterval)));
    },
    [dispatch]
  );

  const goBack = useCallback(() => navigate('/topic/new'), [navigate]);
  const handleDateChange = useCallback((value: dayjs.Dayjs | null) => {
    setCurrentDate(value ? value.toDate() : new Date());
  }, []);

  return (
    <section style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <Title level={2} style={{ marginBottom: '0.25rem' }}>
            Ограничения
          </Title>
          <Paragraph style={{ margin: 0 }}>Слот добавляется по выделению; клик по событию удаляет его.</Paragraph>
        </div>
        <DatePicker value={dayjs(currentDate)} onChange={handleDateChange} allowClear={false} placeholder="Дата" />
      </header>

      <ConstraintsCalendar date={currentDate} events={events} onEventsChange={handleChange} />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={goBack}>Назад</Button>
        <Button type="primary" onClick={goBack}>
          Сохранить и вернуться
        </Button>
      </div>
    </section>
  );
};

export default TopicConstraintsPage;



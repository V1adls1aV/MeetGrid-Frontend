import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { DatePicker, Typography, FloatButton } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import ConstraintsCalendar, {
  ConstraintEvent,
} from "../components/ConstraintsCalendar";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setDraftConstraints } from "../store/topicSlice";
import { Interval } from "../types/topic";
const { Title, Paragraph } = Typography;

const eventToInterval = (event: ConstraintEvent): Interval => ({
  start: event.start.toISOString(),
  end: event.end.toISOString(),
});

const intervalToEvent = (interval: Interval): ConstraintEvent => ({
  id: `${interval.start}-${interval.end}`,
  title: "Окно",
  start: new Date(interval.start),
  end: new Date(interval.end),
});

const TopicConstraintsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const draftConstraints = useAppSelector(
    (state) => state.topic.draftConstraints,
  );
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const events = useMemo(
    () => draftConstraints.map(intervalToEvent),
    [draftConstraints],
  );
  const handleChange = useCallback(
    (nextEvents: ConstraintEvent[]) => {
      dispatch(setDraftConstraints(nextEvents.map(eventToInterval)));
    },
    [dispatch],
  );

  const goBack = useCallback(() => navigate("/topic/new"), [navigate]);
  const handleDateChange = useCallback((value: dayjs.Dayjs | null) => {
    setCurrentDate(value ? value.toDate() : new Date());
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100dvh",
        backgroundColor: "#f5f5f5", // Ensure bg matches
        overflow: "hidden",
      }}
    >
      <section
        style={{
          padding: "1.5rem", // slightly reduced padding to match MainPage often having 1.5rem
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "768px",
          width: "100%",
          position: "relative",
          height: "100%",
        }}
      >
        <header
          style={{
            flexShrink: 0,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            background: "#fff",
            padding: "1rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <Title level={2} style={{ marginBottom: "0.25rem" }}>
              Ограничения
            </Title>
            <Paragraph style={{ margin: 0 }} type="secondary">
              Слот добавляется по выделению; клик по событию удаляет его.
            </Paragraph>
          </div>
          <DatePicker
            value={dayjs(currentDate)}
            onChange={handleDateChange}
            allowClear={false}
            placeholder="Дата"
          />
        </header>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <ConstraintsCalendar
            date={currentDate}
            events={events}
            onEventsChange={handleChange}
          />
        </div>

        <FloatButton
          icon={<SaveOutlined />}
          type="primary"
          style={{
            position: "absolute",
            right: 38,
            bottom: 32,
            width: 56,
            height: 56,
          }}
          onClick={goBack}
          tooltip="Сохранить и вернуться"
        />
      </section>
    </div>
  );
};

export default TopicConstraintsPage;

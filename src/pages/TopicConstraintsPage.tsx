import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { DatePicker, Typography, FloatButton } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import ConstraintsCalendar, {
  ConstraintEvent,
} from "../components/ConstraintsCalendar";
import AnimatedCalendarWrapper from "../components/AnimatedCalendarWrapper";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setDraftConstraints } from "../store/topicSlice";
import { Interval } from "../types/topic";
import styles from "../components/CalendarLayout.module.css";
import useMediaQuery from "../hooks/useMediaQuery";
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
  const isMobile = useMediaQuery("(max-width: 768px)");
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
        className={
          isMobile ? styles.compactPageContainer : styles.pageContainer
        }
        style={{ maxWidth: "768px" }}
      >
        <header
          style={{
            flexShrink: 0,
            display: "flex",
            flexWrap: "nowrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 0,
            background: "#fff",
            padding: "1rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <Title
              level={2}
              style={{ marginBottom: "0.25rem", fontSize: "1.5rem" }}
            >
              Ограничения
            </Title>
            <Paragraph style={{ margin: 0 }} type="secondary">
              Выделяйте отрезки, которые хотите вынести на обсуждение
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
          <AnimatedCalendarWrapper
            date={currentDate}
            onDateChange={setCurrentDate}
            isMobile={isMobile}
          >
            <ConstraintsCalendar
              date={currentDate}
              events={events}
              onEventsChange={handleChange}
            />
          </AnimatedCalendarWrapper>
        </div>

        <FloatButton
          icon={<SaveOutlined />}
          type="primary"
          style={{
            position: "absolute",
            right: "2rem",
            bottom: "2rem",
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

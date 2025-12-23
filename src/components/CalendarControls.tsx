import React, { useCallback } from "react";
import { Button, DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

interface CalendarControlsProps {
  date: Date;
  onChange: (next: Date) => void;
  availableDates?: Set<string>;
}

const shiftDate = (date: Date, offsetDays: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + offsetDays);
  return next;
};

const CalendarControls: React.FC<CalendarControlsProps> = ({
  date,
  onChange,
  availableDates,
}) => {
  const value = dayjs(date);

  const disabledDate = useCallback(
    (current: Dayjs) => {
      if (!availableDates) return false;
      return !availableDates.has(current.format("YYYY-MM-DD"));
    },
    [availableDates],
  );

  const handlePick = useCallback(
    (picked: dayjs.Dayjs | null) => {
      onChange(picked ? picked.toDate() : new Date());
    },
    [onChange],
  );

  const goToday = useCallback(() => {
    const now = new Date();
    now.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChange(now);
  }, [date, onChange]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        alignItems: "center",
      }}
    >
      <DatePicker
        value={value}
        onChange={handlePick}
        allowClear={false}
        placeholder="Дата"
        disabledDate={disabledDate}
      />
      <Button onClick={() => onChange(shiftDate(date, -1))}>Назад</Button>
      <Button onClick={goToday}>Сегодня</Button>
      <Button onClick={() => onChange(shiftDate(date, 1))}>Вперёд</Button>
    </div>
  );
};

export default CalendarControls;

import { dateFnsLocalizer, Messages } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ru } from "date-fns/locale/ru";

const locales = {
  ru,
  "ru-RU": ru,
};

/**
 * Builds a reusable localizer so every calendar shares the same date-fns locale.
 */
export const calendarLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) =>
    startOfWeek(date, {
      weekStartsOn: 1,
    }),
  getDay,
  locales,
});

/**
 * Common Russian messages for the calendar components.
 */
export const calendarMessages: Messages = {
  today: "Сегодня",
  previous: "Назад",
  next: "Вперёд",
  day: "День",
  noEventsInRange: "Нет доступных слотов",
  showMore: (total: number) => `+ ещё ${total}`,
};

export default calendarLocalizer;

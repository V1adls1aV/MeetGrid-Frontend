// Purpose: предоставляет общий локализатор календаря с поддержкой русского языка.
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import ru from 'date-fns/locale/ru';

const locales = {
  ru,
  'ru-RU': ru,
};

/**
 * Builds a reusable localizer so every calendar shares the same date-fns locale.
 */
export const calendarLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) =>
    startOfWeek(date, {
      weekStartsOn: 1,
    }),
  getDay,
  locales,
});

export default calendarLocalizer;



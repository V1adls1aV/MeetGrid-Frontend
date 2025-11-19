import { COMPACT_MEDIA_QUERY, CalendarResourceId, getResourceTheme } from './calendarTokens';

describe('calendarTokens', () => {
  it('returns consistent palette for every resource', () => {
    const ids: CalendarResourceId[] = ['stats50', 'stats70', 'stats90', 'user', 'others'];
    ids.forEach((id) => {
      const theme = getResourceTheme(id);
      expect(theme).toMatchObject({
        border: expect.any(String),
        fill: expect.any(String),
        text: expect.any(String),
      });
    });
  });

  it('exposes compact breakpoint media query', () => {
    expect(COMPACT_MEDIA_QUERY).toBe('(max-width: 640px)');
  });
});



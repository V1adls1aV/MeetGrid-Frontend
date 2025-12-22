const autoSaveTopicResponse = {
  topic: {
    topic_id: 'autosave-demo',
    topic_name: 'Auto-save Topic',
    admin_name: 'Admin',
    description: 'Testing auto-save',
    constraints: [],
    votes: {
      user1: [],
    },
    created_at: '2024-05-01T10:00:00.000Z',
  },
  stats: {
    blocks_50: [],
    blocks_70: [],
    blocks_90: [],
  },
};

describe('Voting auto-save', () => {
  beforeEach(() => {
    cy.viewport(390, 844);
    cy.intercept('GET', '**/api/v1/topic/autosave-demo?username=user1', autoSaveTopicResponse).as('fetchTopic');
    cy.intercept('PUT', '**/api/v1/topic/autosave-demo/pick?username=user1', (req) => {
        req.reply({
            body: autoSaveTopicResponse // Mock success response
        });
    }).as('saveVote');

    cy.visit('/topic/autosave-demo', {
      onBeforeLoad(win) {
        win.localStorage.setItem('meetgrid-username', 'user1');
      },
    });

    cy.wait('@fetchTopic');
  });

  it('hides manual save buttons and triggers auto-save on change', () => {
    // 1. Ensure manual buttons are gone
    cy.contains('button', 'Сбросить').should('not.exist');
    cy.contains('button', 'Сохранить выбор').should('not.exist');

    // 2. Interact with calendar to create a slot (simulating user vote)
    // Finding the calendar time slot area. 
    // Since big-calendar renders time slots as divs, we can click on one.
    // We target a specific time slot to create a "My Window" event.
    // 'rbc-day-slot' contains 'rbc-time-slot' elements.
    
    // Let's click reasonably in the middle of the day view to create a slot.
    // The specific coordinates or exact element might need adjustment based on the actual DOM,
    // but clicking a time slot should trigger creation in this app.
    cy.get('.rbc-time-content')
      .click(200, 300, { force: true }); // Click somewhere in the calendar grid

    // 3. Verify that a PUT request was made to save the vote
    // We wait for a debounced save, or immediate if not debounced yet (implementation detail).
    // Assuming we will implement debounce, we might need a small wait or just wait for the intercept.
    // The test requirements say "auto-save", implying immediate or short debounce.
    // Let's allow a generous timeout for the debounce.
    cy.wait('@saveVote', { timeout: 3000 }).then((interception) => {
        expect(interception.request.body).to.have.property('intervals');
        // We expect intervals to not be empty since we added a slot
        expect(interception.request.body.intervals).to.have.length.at.least(1);
    });
  });
});
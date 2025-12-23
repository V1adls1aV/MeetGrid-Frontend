describe("Create Topic and Vote Flow", () => {
  const topicId = "test-topic-id-123";
  const inviteLink = `http://localhost:5173/topic/${topicId}`;

  const mockTopic = {
    topic_id: topicId,
    topic_name: "Test Meeting",
    admin_name: "Teacher",
    description: "Discussing exam results",
    constraints: [],
    votes: {},
    created_at: new Date().toISOString(),
  };

  const mockStats = {
    blocks_90: [
      {
        start: "2025-12-20T10:00:00Z",
        end: "2025-12-20T11:00:00Z",
        people_min: 1,
        people_max: 1,
      },
    ],
    blocks_70: [],
    blocks_50: [],
    vote_count: 1,
  };

  beforeEach(() => {
    // Mock API requests
    cy.intercept("POST", "**/api/v1/topic?username=*", {
      statusCode: 200,
      body: {
        topic: mockTopic,
        invite_link: inviteLink,
      },
    }).as("createTopic");

    cy.intercept("GET", `**/api/v1/topic/${topicId}?username=*`, {
      statusCode: 200,
      body: {
        topic: mockTopic,
        stats: mockStats,
      },
    }).as("getTopic");
  });

  it("should allow a user to create a topic and another user to vote", () => {
    // 1. Create a topic
    cy.visit("/");
    cy.contains("Создать опрос").click();

    cy.url().should("include", "/topic/new");
    cy.get("input#topicName").type("Test Meeting");
    cy.get("input#adminName").type("Teacher");
    cy.get("textarea#description").type("Discussing exam results");

    cy.get("button[type='submit']").click();

    cy.wait("@createTopic");
    cy.contains("Ссылка для участников").should("be.visible");
    cy.contains(inviteLink).should("be.visible");

    // 2. Votes (Simulating by visiting the link)
    cy.visit(`/topic/${topicId}`);

    // Switching to stats view
    cy.get("button.ant-float-btn").click();

    // Stats display data in the right way.
    cy.contains("1 участник").should("be.visible");
    cy.contains("13:00 — 14:00").should("be.visible");

    // Sadly, I struggled for 5 hours in attempts to test drag and drop.
    // I failed :(
  });
});

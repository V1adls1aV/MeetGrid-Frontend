const topicResponse = {
  topic: {
    topic_id: "demo",
    topic_name: "Demo topic",
    admin_name: "Admin",
    description: "Mobile layout showcase",
    constraints: [],
    votes: {
      mobile: [
        {
          start: "2024-05-10T09:30:00.000Z",
          end: "2024-05-10T10:30:00.000Z",
        },
      ],
    },
    created_at: "2024-05-01T10:00:00.000Z",
  },
  stats: {
    blocks_50: [
      {
        start: "2024-05-10T09:00:00.000Z",
        end: "2024-05-10T09:30:00.000Z",
        people_min: 3,
        people_max: 4,
      },
    ],
    blocks_70: [
      {
        start: "2024-05-10T10:00:00.000Z",
        end: "2024-05-10T10:30:00.000Z",
        people_min: 5,
        people_max: 6,
      },
    ],
    blocks_90: [
      {
        start: "2024-05-10T11:00:00.000Z",
        end: "2024-05-10T11:30:00.000Z",
        people_min: 8,
        people_max: 9,
      },
    ],
  },
};

describe("Voting calendar — mobile", () => {
  it("collapses resources and keeps calendar scrollable", () => {
    cy.viewport(390, 844);
    cy.intercept(
      "GET",
      "**/api/v1/topic/demo?username=mobile",
      topicResponse,
    ).as("fetchTopic");
    cy.visit("/topic/demo", {
      onBeforeLoad(win) {
        win.localStorage.setItem("meetgrid-username", "mobile");
      },
    });

    cy.wait("@fetchTopic");

    cy.get(".rbc-row-resource")
      .should("have.length", 2)
      .then(($cells) => {
        const labels = $cells.toArray().map((cell) => cell.textContent?.trim());
        expect(labels).to.include.members(["Группа", "Я"]);
      });

    cy.get(".rbc-event-content").first().should("contain", "5-6 чел.");

    cy.get(".rbc-time-content").then(($content) => {
      const node = $content[0];
      expect(node.scrollHeight).to.be.greaterThan(node.clientHeight);
    });
  });
});

import React from "react";
import { Button, Typography, Card, Space, Divider } from "antd";
import { Link } from "react-router-dom";
import {
  CalendarOutlined,
  TeamOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const LandingPage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          backgroundColor: "#fff",
          padding: "4rem 1rem",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Title level={1} style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            MeetGrid
          </Title>
          <Title level={3} type="secondary" style={{ fontWeight: 400 }}>
            Голосование по времени встреч — быстрое, простое.
          </Title>
          <Paragraph
            style={{ fontSize: "1.1rem", maxWidth: 600, margin: "2rem auto" }}
          >
            Забудьте о бесконечных переписках в чатах. Выберите удобное время на
            календаре, и мы покажем лучшие варианты для всей группы.
          </Paragraph>
          <Link to="/topic/new">
            <Button
              type="primary"
              size="large"
              style={{ borderRadius: "10px" }}
            >
              Создать опрос
            </Button>
          </Link>
        </div>
      </section>

      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "2rem 1rem" }}>
        {/* Problem Section */}
        <section style={{ marginBottom: "4rem" }}>
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "2rem" }}
          >
            Почему планировать встречи сложно?
          </Title>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <Card
              title="Бесконечные чаты"
              bordered={false}
              style={{ borderRadius: "10px" }}
            >
              <Paragraph>
                "Я могу во вторник после обеда", "А я только в среду утром"...
                Сотни сообщений, в которых теряется суть, и время встречи так и
                не выбрано.
              </Paragraph>
            </Card>
            <Card
              title="Негибкие опросы"
              bordered={false}
              style={{ borderRadius: "10px" }}
            >
              <Paragraph>
                Обычные опросы предлагают фиксированные варианты (день + время).
                Вы не можете выбрать "Вечер пятницы ИЛИ утро субботы" как единый
                удобный блок.
              </Paragraph>
            </Card>
            <Card
              title="Внешние обстоятельства"
              bordered={false}
              style={{ borderRadius: "10px" }}
            >
              <Paragraph>
                Для мероприятия часто бронируют место – кафе, клуб или спортзал.
                И тут выбор становится ещё сложнее: надо учитывать не только
                мнение группы, но и расписание аренды.
              </Paragraph>
            </Card>
          </div>
        </section>

        {/* Use Cases / How it works */}
        <section style={{ marginBottom: "4rem" }}>
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "3rem" }}
          >
            Как это работает
          </Title>
          <Space
            direction="vertical"
            size="large"
            style={{ width: "100%" }}
            split={<Divider />}
          >
            <div
              style={{
                display: "flex",
                gap: "2rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: "3rem",
                  color: "#1677ff",
                  flexShrink: 0,
                  width: 80,
                  textAlign: "center",
                }}
              >
                <CalendarOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={4}>1. Отметьте удобные интервалы</Title>
                <Paragraph>
                  Организатор создает встречу. Участники просто выделяют мышкой
                  (или тапом на телефоне) свободные часы на календаре. Никаких
                  сложных форм.
                </Paragraph>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "2rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: "3rem",
                  color: "#52c41a",
                  flexShrink: 0,
                  width: 80,
                  textAlign: "center",
                }}
              >
                <BarChartOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={4}>2. MeetGrid найдет пересечения</Title>
                <Paragraph>
                  Система автоматически накладывает графики всех участников друг
                  на друга и подсвечивает слоты, где могут присутствовать
                  максимальное количество людей.
                </Paragraph>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "2rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: "3rem",
                  color: "#722ed1",
                  flexShrink: 0,
                  width: 80,
                  textAlign: "center",
                }}
              >
                <TeamOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={4}>3. Выберите лучшее время</Title>
                <Paragraph>
                  Используйте фильтры по длительности встречи, чтобы найти
                  идеальное окно для звонка или очного мероприятия.
                </Paragraph>
              </div>
            </div>
          </Space>
        </section>

        {/* Key Features */}
        <section style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Title level={2}>Почему MeetGrid?</Title>
          <Space
            size="large"
            wrap
            style={{ justifyContent: "center", marginTop: "1rem" }}
          >
            <div style={{ width: 250 }}>
              <ClockCircleOutlined
                style={{
                  fontSize: "2rem",
                  color: "#1677ff",
                  marginBottom: "1rem",
                }}
              />
              <Title level={5}>Скорость</Title>
              <Text type="secondary">Создание опроса занимает 10 секунд.</Text>
            </div>
            <div style={{ width: 250 }}>
              <BarChartOutlined
                style={{
                  fontSize: "2rem",
                  color: "#1677ff",
                  marginBottom: "1rem",
                }}
              />
              <Title level={5}>Наглядно</Title>
              <Text type="secondary">
                Тепловая карта доступности участников.
              </Text>
            </div>
            <div style={{ width: 250 }}>
              <TeamOutlined
                style={{
                  fontSize: "2rem",
                  color: "#1677ff",
                  marginBottom: "1rem",
                }}
              />
              <Title level={5}>Без регистрации</Title>
              <Text type="secondary">
                Участникам не нужно создавать аккаунт.
              </Text>
            </div>
          </Space>
        </section>

        <Divider />

        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <Title level={3}>Готовы спланировать встречу?</Title>
          <Link to="/topic/new">
            <Button type="primary" size="large" style={{ borderRadius: "10px" }}>
              Начать бесплатно
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

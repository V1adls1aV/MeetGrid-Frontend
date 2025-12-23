import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert, Typography } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createTopicThunk, setDraftForm } from "../store/topicSlice";
import { setUsername } from "../store/userSlice";
import { useLocalStorage } from "../hooks/useLocalStorage";

const { Paragraph, Text } = Typography;

interface FormValues {
  topicName: string;
  adminName: string;
  description?: string;
}

const TopicCreatePage: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setStoredName] = useLocalStorage("meetgrid-username", "");
  const { loading, error, inviteLink, draftConstraints, draftForm } =
    useAppSelector((state) => state.topic);

  useEffect(() => {
    form.setFieldsValue(draftForm);
  }, [draftForm, form]);

  const handleFinish = (values: FormValues) => {
    const adminName = values.adminName.trim();
    dispatch(setUsername(adminName));
    setStoredName(adminName);
    dispatch(
      createTopicThunk({
        username: adminName,
        payload: {
          topic_name: values.topicName.trim(),
          description: values.description?.trim() ?? null,
          constraints: draftConstraints,
        },
      }),
    );
  };

  const handleValuesChange = (
    _: Partial<FormValues>,
    allValues: FormValues,
  ) => {
    dispatch(
      setDraftForm({
        topicName: allValues.topicName ?? "",
        adminName: allValues.adminName ?? "",
        description: allValues.description ?? "",
      }),
    );
  };

  const handleOpenConstraints = () => {
    navigate("/topic/new/constraints");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          padding: "2rem",
        }}
      >
        <Typography.Title
          level={2}
          style={{ textAlign: "center", marginBottom: "1.5rem" }}
        >
          Создать опрос
        </Typography.Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          onValuesChange={handleValuesChange}
          initialValues={draftForm}
        >
          <Form.Item
            name="topicName"
            label="Название"
            rules={[{ required: true, message: "Введите название" }]}
          >
            <Input size="large" placeholder="Название встречи" />
          </Form.Item>
          <Form.Item
            name="adminName"
            label="Ваше имя"
            rules={[{ required: true, message: "Введите имя организатора" }]}
          >
            <Input size="large" placeholder="Например, Владислав" />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} placeholder="Цель встречи" />
          </Form.Item>
          <Form.Item label="Ограничения">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <Button
                onClick={handleOpenConstraints}
                style={{ borderRadius: "10px" }}
              >
                Выбрать ограничения
              </Button>
              <Text type={draftConstraints.length ? "success" : "secondary"}>
                {draftConstraints.length
                  ? `Слотов выбрано: ${draftConstraints.length}`
                  : "Слоты пока не выбраны"}
              </Text>
            </div>
          </Form.Item>
          {error && (
            <Form.Item>
              <Alert
                message="Ошибка"
                description={error}
                type="error"
                showIcon
              />
            </Form.Item>
          )}
          <Form.Item style={{ marginTop: "1rem" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ borderRadius: "10px" }}
            >
              Создать и получить ссылку
            </Button>
          </Form.Item>
        </Form>
        {inviteLink && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginTop: "1.5rem",
              padding: "1rem",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <Paragraph
              copyable={{
                text: inviteLink,
                icon: [
                  <CopyOutlined key="copy-icon" style={{ fontSize: "20px" }} />,
                ],
              }}
              style={{ marginBottom: 0 }}
            >
              Ссылка для участников: <a href={inviteLink}>{inviteLink}</a>
            </Paragraph>
          </div>
        )}
      </div>
    </div>
  );
};
export default TopicCreatePage;

import React from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createTopicThunk } from '../store/topicSlice';

const { Paragraph } = Typography;

interface FormValues {
  topicName: string;
  adminName: string;
  description?: string;
}

const TopicCreatePage: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const dispatch = useAppDispatch();
  const { loading, error, inviteLink } = useAppSelector((state) => state.topic);

  const handleFinish = (values: FormValues) => {
    dispatch(
      createTopicThunk({
        username: values.adminName.trim(),
        payload: {
          topic_name: values.topicName.trim(),
          description: values.description?.trim() ?? null,
          constraints: [],
        },
      })
    );
  };

  return (
    <section style={{ padding: '2rem', maxWidth: 540 }}>
      <Typography.Title level={2}>Создать опрос</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="topicName"
          label="Название"
          rules={[{ required: true, message: 'Введите название' }]}
        >
          <Input placeholder="Название встречи" />
        </Form.Item>
        <Form.Item
          name="adminName"
          label="Ваше имя"
          rules={[{ required: true, message: 'Введите имя организатора' }]}
        >
          <Input placeholder="Например, Владислав" />
        </Form.Item>
        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={3} placeholder="Цель встречи" />
        </Form.Item>
        <Form.Item label="Ограничения (пока placeholder)">
          <Input placeholder="Добавим редактор позже" disabled />
        </Form.Item>
        {error && (
          <Form.Item>
            <Alert message="Ошибка" description={error} type="error" showIcon />
          </Form.Item>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Создать и получить ссылку
          </Button>
        </Form.Item>
      </Form>
      {inviteLink && (
        <Paragraph copyable={{ text: inviteLink }}>
          Ссылка для участников: <a href={inviteLink}>{inviteLink}</a>
        </Paragraph>
      )}
    </section>
  );
};

export default TopicCreatePage;

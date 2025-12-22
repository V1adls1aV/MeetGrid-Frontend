import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createTopicThunk, setDraftForm } from '../store/topicSlice';
import { setUsername } from '../store/userSlice';

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
  const { loading, error, inviteLink, draftConstraints, draftForm } = useAppSelector((state) => state.topic);

  useEffect(() => {
    form.setFieldsValue(draftForm);
  }, [draftForm, form]);

  const handleFinish = (values: FormValues) => {
    dispatch(
      createTopicThunk({
        username: values.adminName.trim(),
        payload: {
          topic_name: values.topicName.trim(),
          description: values.description?.trim() ?? null,
          constraints: draftConstraints,
        },
      })
    );
  };

  const handleValuesChange = (_: Partial<FormValues>, allValues: FormValues) => {
    dispatch(
      setDraftForm({
        topicName: allValues.topicName ?? '',
        adminName: allValues.adminName ?? '',
        description: allValues.description ?? '',
      })
    );
  };

  const handleOpenConstraints = () => {
    navigate('/topic/new/constraints');
  };

  return (
    <section style={{ padding: '2rem', maxWidth: 540 }}>
      <Typography.Title level={2}>Создать опрос</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleFinish} onValuesChange={handleValuesChange} initialValues={draftForm}>
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
        <Form.Item label="Ограничения">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button onClick={handleOpenConstraints}>Выбрать ограничения</Button>
            <Text type={draftConstraints.length ? 'success' : 'secondary'}>
              {draftConstraints.length ? `${draftConstraints.length} слотов выбрано` : 'Слоты пока не выбраны'}
            </Text>
          </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Paragraph copyable={{ text: inviteLink }} style={{ marginBottom: 0 }}>
            Ссылка для участников: <a href={inviteLink}>{inviteLink}</a>
          </Paragraph>
        </div>
      )}
    </section>
  );
};

export default TopicCreatePage;

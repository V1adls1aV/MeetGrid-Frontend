// Purpose: форма создания темы и отправка на backend.
import React from 'react';
import { Form, Input, Button } from 'antd';

const TopicCreatePage: React.FC = () => (
  <section style={{ padding: '2rem' }}>
    <h2>Создать опрос</h2>
    <Form layout="vertical">
      <Form.Item label="Название" name="topicName" required>
        <Input placeholder="Название встречи" />
      </Form.Item>
      <Form.Item label="Ваше имя" name="adminName" required>
        <Input placeholder="Например, Ольга" />
      </Form.Item>
      <Form.Item label="Описание" name="description">
        <Input.TextArea rows={3} placeholder="Цель встречи" />
      </Form.Item>
      <Form.Item>
        <Button type="primary">Создать и получить ссылку</Button>
      </Form.Item>
    </Form>
  </section>
);

export default TopicCreatePage;

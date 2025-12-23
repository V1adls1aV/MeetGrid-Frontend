import React, { useEffect } from "react";
import { Modal, Form, TimePicker, Button, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { VotingEvent } from "../types/calendar";

interface EventEditModalProps {
  visible: boolean;
  event: VotingEvent | null;
  onCancel: () => void;
  onSave: (id: string, start: Date, end: Date) => void;
  onDelete: (id: string) => void;
}

const EventEditModal: React.FC<EventEditModalProps> = ({
  visible,
  event,
  onCancel,
  onSave,
  onDelete,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && event) {
      form.setFieldsValue({
        startTime: dayjs(event.start),
        endTime: dayjs(event.end),
      });
    }
  }, [visible, event, form]);

  const handleFinish = (values: { startTime: Dayjs; endTime: Dayjs }) => {
    if (!event) return;

    // Construct new dates keeping the original date part
    const newStart = dayjs(event.start)
      .hour(values.startTime.hour())
      .minute(values.startTime.minute())
      .second(0)
      .millisecond(0)
      .toDate();

    const newEnd = dayjs(event.start)
      .hour(values.endTime.hour())
      .minute(values.endTime.minute())
      .second(0)
      .millisecond(0)
      .toDate();

    onSave(event.id, newStart, newEnd);
  };

  const footer = [
    <Button key="delete" danger onClick={() => event && onDelete(event.id)}>
      Удалить
    </Button>,
    <Button key="cancel" onClick={onCancel}>
      Отмена
    </Button>,
    <Button key="save" type="primary" onClick={() => form.submit()}>
      Сохранить
    </Button>,
  ];

  return (
    <Modal
      open={visible}
      title="Редактировать интервал"
      onCancel={onCancel}
      footer={footer}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          startTime: event ? dayjs(event.start) : null,
          endTime: event ? dayjs(event.end) : null,
        }}
      >
        <Space size="large">
          <Form.Item
            name="startTime"
            label="Начало"
            rules={[{ required: true, message: "Выберите время начала" }]}
          >
            <TimePicker format="HH:mm" minuteStep={15} showNow={false} />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="Конец"
            rules={[
              { required: true, message: "Выберите время окончания" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value.isAfter(getFieldValue("startTime"))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Конец должен быть после начала"),
                  );
                },
              }),
            ]}
          >
            <TimePicker format="HH:mm" minuteStep={15} showNow={false} />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default EventEditModal;

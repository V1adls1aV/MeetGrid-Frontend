import React, { useState } from "react";
import { Modal, Input } from "antd";

interface Props {
  visible: boolean;
  onConfirm: (username: string) => void;
  onCancel: () => void;
}

const UsernameModal: React.FC<Props> = ({ visible, onConfirm, onCancel }) => {
  const [name, setName] = useState("");

  return (
    <Modal
      title="Введите ваше имя"
      open={visible}
      onOk={() => onConfirm(name)}
      onCancel={onCancel}
      okButtonProps={{ disabled: !name.trim() }}
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Например, Гриша"
      />
    </Modal>
  );
};

export default UsernameModal;

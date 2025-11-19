// Purpose: универсальный модальный ввод имени пользователя для голосования.
import React, { useState } from 'react';
import { Modal, Input } from 'antd';

interface Props {
  visible: boolean;
  onConfirm: (username: string) => void;
}

const UsernameModal: React.FC<Props> = ({ visible, onConfirm }) => {
  const [name, setName] = useState('');

  return (
    <Modal
      title="Введите ваше имя"
      open={visible}
      onOk={() => onConfirm(name)}
      onCancel={() => onConfirm(name)}
      okButtonProps={{ disabled: !name.trim() }}
    >
      <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Анна" />
    </Modal>
  );
};

export default UsernameModal;

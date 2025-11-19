import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => (
  <main style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>MeetGrid</h1>
    <p>Голосование по времени встреч — быстрое, простое, на React.</p>
    <Button type="primary">
      <Link to="/topic/new">Создать опрос</Link>
    </Button>
  </main>
);

export default LandingPage;

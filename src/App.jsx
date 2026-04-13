import { useState } from 'react';

export default function App() {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  return (
    <div>
      <h1>Pomodoro Timer</h1>
    </div>
  );
}
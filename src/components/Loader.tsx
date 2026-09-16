import React, { useEffect, useState } from 'react';

export const Loader: React.FC = () => {
  const [dateString, setDateString] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    const now = new Date();
    const months = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December',
    ];
    setDateString(`${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);

    const timer = setTimeout(() => {
      setIsHidden(true);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const handleTransitionEnd = () => {
    if (isHidden) {
      setIsRemoved(true);
    }
  };

  if (isRemoved) return null;

  return (
    <div
      id="loader"
      aria-hidden="true"
      role="presentation"
      className={isHidden ? 'is-hidden' : ''}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="loader__inner">
        <p className="loader__date" id="loader-date">{dateString}</p>
        <div className="loader__rule" aria-hidden="true" />
        <p className="loader__sub">Just Us</p>
      </div>
    </div>
  );
};


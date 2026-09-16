import React from 'react';
import { useHeartbeatTimer } from '../hooks/useHeartbeatTimer';

export const StatusBar: React.FC = () => {
  const { timecode } = useHeartbeatTimer();

  return (
    <div id="status-bar" aria-label="Relationship status metadata">
      <div className="status-bar__inner">
        <span className="status-bar__label">EST. XIV JUN MMXXVI</span>
        <div className="status-bar__center">
          <span className="status-bar__timecode" id="timecode-display" aria-live="off">
            {timecode}
          </span>
        </div>
        <span className="status-bar__label">Just Us — ONGOING</span>
      </div>
    </div>
  );
};

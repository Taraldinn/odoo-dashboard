// src/components/AndroidGestureBar.jsx
import React from 'react';

/**
 * AndroidGestureBar
 * Android system bottom gesture navigation pill.
 */
export const AndroidGestureBar = () => {
  return (
    <div className="android-gesture-bar-container" aria-hidden="true">
      <div className="android-gesture-pill" />
    </div>
  );
};

export default AndroidGestureBar;

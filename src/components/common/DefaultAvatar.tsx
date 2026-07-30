import React from 'react';

interface DefaultAvatarProps {
  size?: number;
  className?: string;
}


const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ size = 40, className = '' }) => {
  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: '#DFE5E7',
      }}
    >
      <svg
        viewBox="0 0 212 212"
        width={size * 0.65}
        height={size * 0.65}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M106 0C47.5 0 0 47.5 0 106s47.5 106 106 106 106-47.5 106-106S164.5 0 106 0z"
          fill="#DFE5E7"
        />
        <path
          d="M106 47c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35-35-15.7-35-35-35z"
          fill="#ffffff"
        />
        <path
          d="M106 127c-35.3 0-64 18.7-64 42v10c0 1.1.9 2 2 2h124c1.1 0 2-.9 2-2v-10c0-23.3-28.7-42-64-42z"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
};

export default DefaultAvatar;

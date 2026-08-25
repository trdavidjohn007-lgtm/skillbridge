"use client";

interface BridgeLogoProps {
  size?: number;
  className?: string;
  white?: boolean;
}

export default function BridgeLogo({ size = 32, className = "", white = false }: BridgeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bridge deck */}
      <rect
        x="4"
        y="24"
        width="56"
        height="6"
        rx="2"
        fill={white ? "#FFFFFF" : "#F97316"}
      />
      
      {/* Left pillar */}
      <rect
        x="10"
        y="30"
        width="6"
        height="22"
        rx="1"
        fill={white ? "#FFFFFF" : "#EA580C"}
      />
      
      {/* Right pillar */}
      <rect
        x="48"
        y="30"
        width="6"
        height="22"
        rx="1"
        fill={white ? "#FFFFFF" : "#EA580C"}
      />
      
      {/* Center pillar */}
      <rect
        x="29"
        y="30"
        width="6"
        height="22"
        rx="1"
        fill={white ? "#FFFFFF" : "#FB923C"}
      />
      
      {/* Left cable */}
      <path
        d="M13 24 Q13 12, 29 12"
        stroke={white ? "#FFFFFF" : "#F97316"}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Right cable */}
      <path
        d="M35 12 Q51 12, 51 24"
        stroke={white ? "#FFFFFF" : "#F97316"}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Center tower */}
      <rect
        x="27"
        y="6"
        width="10"
        height="18"
        rx="2"
        fill={white ? "#FFFFFF" : "#FB923C"}
      />
      
      {/* Tower top */}
      <rect
        x="25"
        y="4"
        width="14"
        height="4"
        rx="2"
        fill={white ? "#FFFFFF" : "#F97316"}
      />
      
      {/* Water/ground */}
      <rect
        x="0"
        y="52"
        width="64"
        height="12"
        rx="2"
        fill={white ? "rgba(255,255,255,0.15)" : "#FEF3C7"}
      />
      
      {/* Water waves */}
      <path
        d="M0 56 Q8 53, 16 56 Q24 59, 32 56 Q40 53, 48 56 Q56 59, 64 56"
        stroke={white ? "rgba(255,255,255,0.3)" : "#FDE68A"}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

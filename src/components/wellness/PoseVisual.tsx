import React from "react";
import type { PoseVisualKey } from "@/types/wellness";

type Props = {
  visualKey: PoseVisualKey;
  className?: string;
  /** Enable subtle animated accents */
  animated?: boolean;
};

// Abstract, non-explicit SVG glyphs conveying orientation only
export const PoseVisual: React.FC<Props> = ({ visualKey, className, animated }) => {
  const renderPeople = (layout: PoseVisualKey) => {
    const person = (cx: number, cy: number, colorVar: string) => (
      <g>
        <circle cx={cx} cy={cy - 12} r={6} fill={colorVar} />
        <rect x={cx - 5} y={cy - 10} width={10} height={24} rx={4} fill={colorVar} opacity={0.85} />
      </g>
    );

    switch (layout) {
      case "facing":
        return (
          <g>
            {person(44, 48, "#7c3aed")}
            {person(76, 48, "#22d3ee")}
          </g>
        );
      case "side_by_side":
        return (
          <g>
            {person(48, 48, "#7c3aed")}
            {person(72, 48, "#22d3ee")}
          </g>
        );
      case "back_to_back":
        return (
          <g>
            {person(44, 48, "#7c3aed")}
            {person(76, 48, "#22d3ee")}
            <path d="M50 42 L70 42" stroke="currentColor" opacity={0.2} />
          </g>
        );
      case "seated_embrace":
        return (
          <g>
            {person(56, 52, "#7c3aed")}
            {person(64, 52, "#22d3ee")}
          </g>
        );
      case "stacked":
        return (
          <g>
            {person(60, 40, "#7c3aed")}
            {person(60, 58, "#22d3ee")}
          </g>
        );
      case "support_stand":
        return (
          <g>
            {person(52, 48, "#7c3aed")}
            {person(68, 44, "#22d3ee")}
          </g>
        );
      case "support_kneel":
        return (
          <g>
            {person(52, 56, "#7c3aed")}
            {person(70, 46, "#22d3ee")}
          </g>
        );
      case "recline":
        return (
          <g>
            <rect x={32} y={48} width={20} height={6} rx={3} fill="#7c3aed" />
            <rect x={68} y={48} width={20} height={6} rx={3} fill="#22d3ee" />
          </g>
        );
      case "lunge_support":
        return (
          <g>
            {person(48, 48, "#7c3aed")}
            <rect x={70} y={50} width={14} height={4} rx={2} fill="#22d3ee" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg viewBox="0 0 120 80" className={className} role="img" aria-label="Abstract position visual">
      <defs>
        {animated && (
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      <rect x="2" y="2" width="116" height="76" rx="10" ry="10" fill="none" stroke="currentColor" opacity={0.2} />
      {animated && (
        <circle cx="60" cy="40" r="36" fill="url(#glow)" className="animate-ml-process" />
      )}
      {renderPeople(visualKey)}
    </svg>
  );
};

export default PoseVisual;

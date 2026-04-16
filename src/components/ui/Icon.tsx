import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
}

/**
 * Dynamic Lucide icon component.
 * Renders any Lucide icon by name string.
 * Tree-shake friendly — only icons actually used get bundled.
 *
 * Usage: <Icon name="Dumbbell" size={24} color="#7BA7CC" />
 */
export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  // Dynamic lookup from lucide-react
  const IconComponent = (LucideIcons as Record<string, React.FC<LucideProps>>)[name];

  if (!IconComponent) {
    console.warn(`[Icon] Unknown icon: "${name}"`);
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: props.size || 24,
          height: props.size || 24,
        }}
      >
        <svg
          width={props.size || 24}
          height={props.size || 24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      </span>
    );
  }

  return <IconComponent {...props} />;
};

/* ===== Icon with neumorphic circle background ===== */
interface IconCircleProps extends IconProps {
  size?: number;
  iconSize?: number;
  accent?: 'blue' | 'peach' | 'green' | 'red';
  variant?: 'raised' | 'pressed';
}

export const IconCircle: React.FC<IconCircleProps> = ({
  name,
  size = 48,
  iconSize = 22,
  accent = 'blue',
  variant = 'raised',
  ...iconProps
}) => {
  const accentColors = {
    blue: '#7BA7CC',
    peach: '#E8A87C',
    green: '#8ECDA8',
    red: '#D4756B',
  };

  const shadowStyle =
    variant === 'pressed'
      ? 'inset 3px 3px 6px #C8BFB5, inset -3px -3px 6px #F5EDE5'
      : '4px 4px 8px #C8BFB5, -4px -4px 8px #F5EDE5';

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        boxShadow: shadowStyle,
        backgroundColor: '#E8E0D8',
      }}
    >
      <Icon
        name={name}
        size={iconSize}
        color={accentColors[accent]}
        strokeWidth={2}
        {...iconProps}
      />
    </div>
  );
};

/* ===== Icon with tinted background ===== */
interface IconTintedProps extends IconProps {
  size?: number;
  iconSize?: number;
  accent?: 'blue' | 'peach' | 'green' | 'red';
  shape?: 'circle' | 'rounded';
}

export const IconTinted: React.FC<IconTintedProps> = ({
  name,
  size = 44,
  iconSize = 20,
  accent = 'blue',
  shape = 'circle',
  ...iconProps
}) => {
  const bgColors = {
    blue: 'rgba(123, 167, 204, 0.15)',
    peach: 'rgba(232, 168, 124, 0.15)',
    green: 'rgba(142, 205, 168, 0.15)',
    red: 'rgba(212, 117, 107, 0.15)',
  };

  const fgColors = {
    blue: '#7BA7CC',
    peach: '#E8A87C',
    green: '#8ECDA8',
    red: '#D4756B',
  };

  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColors[accent],
        borderRadius: shape === 'circle' ? '50%' : 12,
      }}
    >
      <Icon
        name={name}
        size={iconSize}
        color={fgColors[accent]}
        strokeWidth={2}
        {...iconProps}
      />
    </div>
  );
};

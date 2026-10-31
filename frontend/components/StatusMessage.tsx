import type { ReactNode } from 'react';
import styles from './StatusMessage.module.css';

interface StatusMessageProps {
  variant: 'loading' | 'error' | 'empty';
  children: ReactNode;
}

export default function StatusMessage({ variant, children }: StatusMessageProps) {
  return (
    <div
      className={`${styles.message} ${styles[variant]}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}

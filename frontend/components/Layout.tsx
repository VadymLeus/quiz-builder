import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import styles from './Layout.module.css';

const NAV_ITEMS = [
  { href: '/quizzes', label: 'Quizzes' },
  { href: '/create', label: 'Create quiz' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useRouter();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/quizzes" className={styles.brand}>
            Quiz Builder
          </Link>
          <nav aria-label="Main" className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface ProtectedPageProps {
  children: React.ReactNode;
}

export function ProtectedPage({ children }: ProtectedPageProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <nav className={styles.nav}>
            <Link 
              href="/" 
              className={pathname === "/" ? styles.navLinkActive : styles.navLink}
            >
              Validação
            </Link>
            <Link 
              href="/clientes" 
              className={pathname === "/clientes" ? styles.navLinkActive : styles.navLink}
            >
              Clientes
            </Link>
          </nav>
          <div className={styles.userInfo}>
            <span>Bem-vindo, {session.user?.name || session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className={styles.logoutButton}
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

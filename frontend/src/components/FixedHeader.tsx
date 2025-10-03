'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function FixedHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsAuthenticated(false);
        // Clear any cached data and redirect
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/login':
        return 'Entrar';
      case '/register':
        return 'Cadastrar';
      case '/dashboard':
        return 'Dashboard';
      case '/lists/new':
        return 'Nova Lista';
      default:
        if (pathname.startsWith('/lists/')) {
          return 'Lista de Compras';
        }
        return 'Lista de Compras';
    }
  };

  const showBackButton = isAuthenticated && pathname !== '/dashboard' && pathname !== '/' && pathname !== '/login' && pathname !== '/register';
  const showNewListButton = isAuthenticated && pathname === '/dashboard';
  const showLoginButton = false; // Remove redundant button - login page has its own navigation
  const showRegisterButton = false; // Remove redundant button - register page has its own navigation
  const showLogoutButton = isAuthenticated && pathname !== '/login' && pathname !== '/register';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </Button>
          )}
          <h1 className="text-xl font-semibold text-foreground">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {showNewListButton && (
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/lists/new" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Lista
              </Link>
            </Button>
          )}

          {showLoginButton && (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
          )}

          {showRegisterButton && (
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/register">Cadastrar</Link>
            </Button>
          )}

          {showLogoutButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

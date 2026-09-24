"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Nuevo pedido recibido",
    description: "Carlos Mendoza realizó una compra por $189.000",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: "n2",
    title: "Stock bajo",
    description: "Pantalón Sastrero Moderno está agotado",
    time: "Hace 1 hora",
    read: false,
  },
  {
    id: "n3",
    title: "Nuevo usuario registrado",
    description: "Sofía Restrepo se unió a la plataforma",
    time: "Hace 3 horas",
    read: true,
  },
];

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS);
  const ref = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-brand-muted hover:text-brand-dark transition-colors"
        aria-label="Notificaciones"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-border/60 rounded-card shadow-modal z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-medium text-brand-muted hover:text-brand-dark underline underline-offset-2"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/20">
            {notifications.length === 0 ? (
              <p className="text-xs text-brand-muted text-center py-8">
                No tienes notificaciones.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3 hover:bg-neutral-50/60 transition-colors cursor-pointer",
                    !n.read && "bg-blue-50/30"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-dark">{n.title}</p>
                      <p className="text-[11px] text-brand-muted mt-0.5">{n.description}</p>
                      <p className="text-[10px] text-brand-muted/70 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
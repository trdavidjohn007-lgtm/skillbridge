"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  sessionId: string | null;
  topic: string | null;
  read: boolean;
  createdAt: string;
}

interface NavbarProps {
  activePage?: string;
  credits?: number;
  anonymousName?: string;
}

import BridgeLogo from "@/components/BridgeLogo";

export default function Navbar({ activePage = "Dashboard", credits = 100, anonymousName = "Student" }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Requests", href: "/requests" },
    { label: "Resources", href: "/resources" },
    { label: "Motivation", href: "/study-motivation" },
    { label: "Progress", href: "/progress" },
    { label: "Leaderboard", href: "/leaderboard" },
  ];

  // Fetch notifications
  useEffect(() => {
    fetch("/api/p2p/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.notifications) {
          setNotifications(d.notifications);
          setUnreadCount(d.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  // Poll for new notifications every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/p2p/notifications")
        .then((r) => r.json())
        .then((d) => {
          if (d.notifications) {
            setNotifications(d.notifications);
            setUnreadCount(d.unreadCount || 0);
          }
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (notifId: string) => {
    fetch("/api/p2p/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: notifId }),
    }).then((r) => r.json()).then((d) => {
      if (d.notifications) {
        setNotifications(d.notifications);
        setUnreadCount(d.unreadCount || 0);
      }
    }).catch(() => {});
  };

  const markAllRead = () => {
    fetch("/api/p2p/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    }).then((r) => r.json()).then((d) => {
      if (d.notifications) {
        setNotifications(d.notifications);
        setUnreadCount(d.unreadCount || 0);
      }
    }).catch(() => {});
  };

  const handleNotifClick = (notif: Notification) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.sessionId) {
      router.push(`/session/${notif.sessionId}`);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            title="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm overflow-hidden">
              <BridgeLogo size={24} white />
            </div>
            <span className="font-bold text-slate-900 hidden sm:block">SkillBridge</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activePage === item.label
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Credits badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
            <span className="text-sm">🪙</span>
            <span className="font-bold text-amber-700 text-sm">{credits}</span>
          </div>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-orange-500 font-medium hover:text-orange-600"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-3xl mb-2">🔔</div>
                      <p className="text-sm text-slate-400">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${
                          !notif.read ? "bg-orange-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notif.type === "request_accepted"
                              ? "bg-green-50"
                              : notif.type === "session_complete"
                              ? "bg-blue-50"
                              : "bg-purple-50"
                          }`}>
                            {notif.type === "request_accepted" ? "✅" : notif.type === "session_complete" ? "💬" : "🔔"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 text-sm">{notif.title}</span>
                              {!notif.read && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{timeAgo(notif.createdAt)}</span>
                          </div>
                          {notif.sessionId && (
                            <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-600 rounded font-medium flex-shrink-0">
                              Join →
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
              {anonymousName[0]}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden lg:block">{anonymousName}</span>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => { router.push(item.href); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activePage === item.label ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

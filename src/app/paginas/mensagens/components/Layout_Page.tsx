'use client';

import { useNotifications } from '@/contexts/postgre/Notificacao_Context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from './Header';
import Filtros from './Filtros';
import Cards from './Cards';

export default function LayoutPage() {
  const router = useRouter();
  const { messages, unreadCount, markAsRead, deleteMessage } =
    useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredMessages = messages.filter(msg =>
    filter === 'all' ? true : !msg.read
  );

  const handleGoBack = () => router.back();

  // ---------------------------------------------------------------------------------

  return (
    // ===== div - container principal =====
    <div className="min-h-screen bg-slate-50">
      {/* ==== div - header / filtros / cards */}
      <div className="container mx-auto space-y-14 px-4 py-8">
        {/* ===== header ===== */}
        <Header unreadCount={unreadCount} onBack={handleGoBack} />

        {/* ===== filtros ===== */}
        <Filtros
          filter={filter}
          setFilter={setFilter}
          total={messages.length}
          unread={unreadCount}
        />

        {/* ===== cards ===== */}
        <Cards
          messages={filteredMessages}
          onMarkAsRead={markAsRead}
          onDelete={deleteMessage}
        />
      </div>
    </div>
  );
}

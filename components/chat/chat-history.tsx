
import React from 'react';
import { ChatMessage } from './chat-message';
import type { Message } from '@/types/agent-zero';

interface ChatHistoryProps {
  messages: Message[];
  onEdit: (messageId: string, newContent: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, onEdit }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} onEdit={onEdit} />
      ))}
    </div>
  );
};

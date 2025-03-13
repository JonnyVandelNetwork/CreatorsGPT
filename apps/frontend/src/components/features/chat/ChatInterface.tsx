import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'avatar';
  timestamp: Date;
  videoUrl?: string;
  status?: 'sending' | 'processing' | 'complete' | 'error';
}

interface ChatInterfaceProps {
  avatarName: string;
  avatarImageUrl: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isGenerating: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  avatarName,
  avatarImageUrl,
  messages,
  onSendMessage,
  isGenerating,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [avatarImageError, setAvatarImageError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isGenerating) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {!avatarImageError && avatarImageUrl ? (
              <Image
                src={avatarImageUrl}
                alt={avatarName}
                fill
                className="object-cover"
                onError={() => setAvatarImageError(true)}
              />
            ) : (
              <span className="text-sm font-medium text-gray-500">
                {avatarName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-medium">{avatarName}</h2>
            <p className="text-xs text-gray-500">
              {isGenerating ? 'Generating response...' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 border dark:border-gray-700'
              }`}
            >
              {message.sender === 'avatar' && message.videoUrl ? (
                <div className="relative w-full aspect-video rounded overflow-hidden mb-2">
                  <video
                    src={message.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}
              
              <p>{message.content}</p>
              
              {message.status && message.status !== 'complete' && (
                <div className="mt-2 text-xs opacity-70">
                  {message.status === 'sending' && 'Sending...'}
                  {message.status === 'processing' && 'Processing video...'}
                  {message.status === 'error' && 'Error generating video'}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isGenerating}
            className="p-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}; 
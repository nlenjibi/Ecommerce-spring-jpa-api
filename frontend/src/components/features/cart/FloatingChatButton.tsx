'use client';

import React, { useContext, useState, useEffect } from 'react';
import { MessageCircle, X, HelpCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { LiveSupportContext } from '@/context/SocialLinksContext';

interface FloatingChatButtonProps {
  position?: 'bottom-left' | 'bottom-right';
}

export function FloatingChatButton({ position = 'bottom-right' }: FloatingChatButtonProps) {
  const context = useContext(LiveSupportContext);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewBadge, setHasNewBadge] = useState(true);

  // Hide new badge after first interaction
  useEffect(() => {
    if (isOpen) {
      setHasNewBadge(false);
      // Store in localStorage that user has seen the chat
      localStorage.setItem('chat_seen', 'true');
    }
  }, [isOpen]);

  // Check if user has seen chat before
  useEffect(() => {
    const chatSeen = localStorage.getItem('chat_seen');
    if (chatSeen) {
      setHasNewBadge(false);
    }
  }, []);

  // Don't render if no chat configs or disabled
  if (!context?.floatingButtonEnabled || !context?.chatConfigs || context.chatConfigs.length === 0) {
    return null;
  }

  const positionClass = position === 'bottom-left' ? 'left-6' : 'right-6';

  const getIconComponent = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'whatsapp': '💬',
      'facebook': '👥',
      'telegram': '✈️',
      'live_chat': '💭',
      'messenger': '💬',
      'instagram': '📷',
      'email': '📧',
    };
    return iconMap[type.toLowerCase()] || '💬';
  };

  const getChatTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'whatsapp': 'hover:bg-green-50',
      'facebook': 'hover:bg-blue-50',
      'telegram': 'hover:bg-sky-50',
      'live_chat': 'hover:bg-purple-50',
      'messenger': 'hover:bg-blue-50',
      'instagram': 'hover:bg-pink-50',
      'email': 'hover:bg-gray-50',
    };
    return colorMap[type.toLowerCase()] || 'hover:bg-gray-50';
  };

  const openChat = (url: string, title: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      console.log(`📞 Opening ${title} chat...`);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.floating-chat-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`fixed ${positionClass} bottom-6 z-50 floating-chat-container`}>
      {/* Chat Menu */}
      {isOpen && (
        <div className="absolute bottom-20 bg-white rounded-xl shadow-2xl border border-gray-200 mb-4 w-80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MessageCircle size={20} />
              How can we help?
            </h3>
            <p className="text-xs text-blue-100 mt-1">
              Choose your preferred contact method
            </p>
          </div>

          {/* Help Links Section */}
          {context?.helpLinks && context.helpLinks.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <HelpCircle size={16} className="text-blue-600" />
                  Quick Help
                </h4>
              </div>

              <div className="max-h-40 overflow-y-auto">
                {context.helpLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-all"
                  >
                    <span className="font-medium group-hover:text-blue-600 transition-colors">
                      {link.title}
                    </span>
                    <ExternalLink
                      size={14}
                      className="text-gray-400 group-hover:text-blue-600 transition-colors"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Chat Options Section */}
          <div className="p-4 bg-gradient-to-b from-white to-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
              Live Support
            </p>
            <div className="space-y-2">
              {context.chatConfigs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => openChat(config.url, config.title)}
                  className={`group w-full flex items-center justify-between px-4 py-3 rounded-lg ${getChatTypeColor(config.type)} text-left transition-all border border-transparent hover:border-gray-200 hover:shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl transition-transform group-hover:scale-110">
                      {getIconComponent(config.type)}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                        {config.title}
                      </span>
                      {config.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {config.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              We typically reply within a few minutes
            </p>
          </div>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-16 h-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-white font-bold overflow-hidden ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-90'
            : 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700'
        }`}
        aria-label={isOpen ? 'Close chat menu' : 'Open chat menu'}
      >
        {/* Icon */}
        <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
          {isOpen ? (
            <X size={28} className="drop-shadow-lg" />
          ) : (
            <MessageCircle size={28} className="drop-shadow-lg" />
          )}
        </div>

        {/* New Badge */}
        {hasNewBadge && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white"></span>
          </span>
        )}

        {/* Ripple Effect on Hover */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
        )}
      </button>

      {/* Pulse Animation Ring (when closed) */}
      {!isOpen && (
        <>
          <div className="absolute inset-0 w-16 h-16 rounded-full animate-ping bg-blue-400 opacity-20 pointer-events-none" />
          <div className="absolute inset-0 w-16 h-16 rounded-full animate-pulse bg-purple-400 opacity-10 pointer-events-none"
               style={{ animationDelay: '0.5s' }}
          />
        </>
      )}

      {/* Tooltip (when closed) */}
      {!isOpen && (
        <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
          Need help? Chat with us
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-gray-900"></div>
        </div>
      )}
    </div>
  );
}
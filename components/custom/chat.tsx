// chat.tsx (updated with manual scroll control)
"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";
import { useSidebar } from "@/contexts/SidebarProvider";
import { Sidebar } from "./Sidebar";
import { GripVertical } from "lucide-react";
import { ArrowDown, Search } from 'lucide-react';
import { SearchLoader } from './search-loader';

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const { isOpen, sidebarWidth, setSidebarWidth } = useSidebar();
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Handle mouse down on resize handle
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newSidebarWidth = containerRect.right - e.clientX;
      
      // Constrain width between 300px and 600px
      if (newSidebarWidth >= 300 && newSidebarWidth <= 600) {
        setSidebarWidth(newSidebarWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, setSidebarWidth]);

  // Manual scroll control
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      setShowScrollButton(!atBottom);
      setShouldAutoScroll(atBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messagesContainerRef]);

  // Auto-scroll only when new messages are added (not during streaming)
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, shouldAutoScroll]); // Only trigger on message count change, not content changes
  
  // Search functionality
  const handleSearch = async (query: string) => {
    console.log('handleSearch called with query:', query);
    setIsSearching(true);
    try {
      console.log('Making search API call...');
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      console.log('Search response status:', response.status);
      
      if (response.ok) {
        const results = await response.json();
        console.log('Search results:', results);
        
        // Format results for the AI
        const searchResults = results.map((r: any, i: number) => 
          `${i + 1}. **${r.title}**\n   ${r.snippet}\n   Source: ${r.link}`
        ).join('\n\n');
        
        append({ 
          role: 'user', 
          content: `Search results for "${query}":\n\n${searchResults}\n\nPlease provide a summary of these results.` 
        });
      } else {
        console.log('Search failed with status:', response.status);
        append({ 
          role: 'user', 
          content: `Search failed for "${query}". Please try a different search term.` 
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      append({ 
        role: 'user', 
        content: `Search failed for "${query}". Please try again later.` 
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-row h-dvh bg-[#181A20] relative"
    >
      {/* Main Chat Area */}
      <div 
        className={`flex flex-col justify-center pb-4 md:pb-8 transition-all duration-300 ${
          isOpen ? 'flex-1' : 'w-full'
        }`}
        style={{
          minWidth: isOpen ? '300px' : '100%',
          maxWidth: isOpen ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        <div className="flex flex-col justify-between items-center gap-4 h-full">
          <div
            ref={messagesContainerRef}
            className="flex flex-col gap-4 h-full w-full items-center overflow-y-auto px-4 md:px-0"
          >
            {messages.length === 0 && <Overview />}

            {messages.map((message, idx) => (
              <PreviewMessage
                key={message.id}
                chatId={id}
                role={message.role}
                content={message.content}
                attachments={message.experimental_attachments}
                toolInvocations={message.toolInvocations}
                append={append}
                isStreaming={
                  message.role === 'assistant' &&
                  isLoading &&
                  idx === messages.length - 1
                }
              />
            ))}
            {/* Show shimmer as soon as user sends a message */}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <PreviewMessage
                key="thinking-shimmer"
                chatId={id}
                role="assistant"
                content={''}
                toolInvocations={[]}
                isStreaming={true}
              />
            )}
            
            {/* Show search loader when searching */}
            {isSearching && (
              <div className="w-full max-w-2xl">
                <SearchLoader />
              </div>
            )}

            <div
              ref={messagesEndRef}
              className="shrink-0 min-w-[24px] min-h-[24px]"
            />
          </div>

          {/* Floating Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              className="fixed bottom-24 right-8 z-30 bg-fuchsia-700 hover:bg-fuchsia-600 text-white p-2 rounded-full shadow-lg transition"
              onClick={() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setShouldAutoScroll(true);
              }}
            >
              <ArrowDown className="size-5" />
            </button>
          )}

          <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[500px] max-w-[calc(100dvw-32px)] px-4 md:px-0">
            <MultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              append={append}
              onSearch={handleSearch}
            />
          </form>
        </div>
      </div>

      {/* Resize Handle - only show when sidebar is open */}
      {isOpen && (
        <div
          className="w-1 bg-border hover:bg-blue-500/50 cursor-col-resize transition-colors relative z-10"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
}
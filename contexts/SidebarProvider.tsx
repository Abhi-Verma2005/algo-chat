// contexts/SidebarContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  content: ReactNode | null;
  setSidebarContent: (content: ReactNode) => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const setSidebarContent = (newContent: ReactNode) => {
    setContent(newContent);
    setIsOpen(true);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setContent(null);
  };

  return (
    <SidebarContext.Provider value={{
      isOpen,
      content,
      setSidebarContent,
      closeSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
// contexts/SidebarContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  content: ReactNode | null;
  sidebarWidth: number;
  setSidebarContent: (content: ReactNode) => void;
  closeSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(400); // Default width in pixels

  const setSidebarContent = (newContent: ReactNode) => {
    setContent(newContent);
    setIsOpen(true);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setContent(null);
  };

  const toggleSidebar = () => {
    if (isOpen) {
      closeSidebar();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <SidebarContext.Provider value={{
      isOpen,
      content,
      sidebarWidth,
      setSidebarContent,
      closeSidebar,
      setSidebarWidth,
      toggleSidebar
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
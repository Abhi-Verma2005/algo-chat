// components/custom/sidebar.tsx (updated for cohesive layout)
"use client";

import { useSidebar } from "@/contexts/SidebarProvider";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function Sidebar() {
  const { isOpen, content, sidebarWidth, closeSidebar } = useSidebar();

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-0 top-0 h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-lg z-50 flex flex-col"
            style={{ width: `${sidebarWidth}px` }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Interactive Content
              </h2>
              <button
                onClick={closeSidebar}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
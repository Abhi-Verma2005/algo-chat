"use client";

import { Attachment, ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion } from "framer-motion";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { toast } from "sonner";

import { ArrowUpIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import useWindowSize from "./use-window-size";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { GraduationCap, Search, Sparkles, Lightbulb, BarChart2, Shuffle, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const suggestedActions = [
  {
    title: "Explain binary search",
    label: "with step-by-step walkthrough",
    action: "Explain binary search with step-by-step walkthrough",
  },
  {
    title: "Help with dynamic programming",
    label: "understand memoization",
    action: "Help me understand dynamic programming and memoization",
  },
  {
    title: "Analyze time complexity",
    label: "of my sorting algorithm",
    action: "Analyze the time complexity of my sorting algorithm",
  },
  {
    title: "Debug my code",
    label: "find the issue in my solution",
    action: "Help me debug my code and find the issue",
  },
];

const quickActions = [
  {
    title: "Get a hint",
    label: "for current problem",
    action: "Give me a hint for my current problem.",
    icon: Lightbulb,
    color: "text-fuchsia-200 hover:bg-fuchsia-900/40 focus:bg-fuchsia-900/40"
  },
  {
    title: "Show progress",
    label: "DSA learning progress",
    action: "Show my DSA progress.",
    icon: BarChart2,
    color: "text-sky-200 hover:bg-sky-900/40 focus:bg-sky-900/40"
  },
  {
    title: "Random problem",
    label: "get a new challenge",
    action: "Give me a random DSA problem.",
    icon: Shuffle,
    color: "text-green-200 hover:bg-green-900/40 focus:bg-green-900/40"
  },
  {
    title: "Search contests",
    label: "latest programming contests",
    action: "Search for latest programming contests and competitions.",
    icon: Search,
    color: "text-orange-200 hover:bg-orange-900/40 focus:bg-orange-900/40"
  },
  {
    title: "Reset chat",
    label: "start fresh conversation",
    action: "Let's start fresh. Reset our conversation.",
    icon: RefreshCw,
    color: "text-zinc-300 hover:bg-zinc-800/60 focus:bg-zinc-800/60"
  },
];

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
  onSearch,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  onSearch?: (query: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      // Reset height to auto first to get the actual scrollHeight
      textareaRef.current.style.height = "auto";
      
      // Calculate the new height based on content
      const scrollHeight = textareaRef.current.scrollHeight;
      
      // Set a maximum height (you can adjust this value as needed)
      const maxHeight = 200; // pixels
      const minHeight = 72; // 3 rows * 24px (approximate line height)
      
      // Apply the calculated height with constraints
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Enable scrolling if content exceeds max height
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [attachments, handleSubmit, setAttachments, width]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      } else {
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  return (
    <div className="relative w-full flex flex-col gap-4">
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <div className="grid sm:grid-cols-2 gap-4 w-full md:px-0 mx-auto md:max-w-[500px]">
            {suggestedActions.map((suggestedAction, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.05 * index }}
                key={index}
                className={index > 1 ? "hidden sm:block" : "block"}
              >
                <button
                  onClick={async () => {
                    append({
                      role: "user",
                      content: suggestedAction.action,
                    });
                  }}
                  className="group border border-zinc-200/60 dark:border-zinc-700/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm w-full text-left text-zinc-700 dark:text-zinc-300 rounded-xl p-4 text-sm hover:bg-zinc-50/80 dark:hover:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200 flex flex-col gap-1 hover:shadow-sm"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {suggestedAction.label}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {/* {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: "",
                name: filename,
                contentType: "",
              }}
              isUploading={true}
            />
          ))} */}
        </div>
      )}

      <div className="relative">
      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
          className="min-h-[72px] max-h-[200px] overflow-hidden resize-none rounded-2xl text-base bg-[#23272e] border border-[#2d3138] text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-lg backdrop-blur-sm"
        rows={3}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (isLoading) {
              toast.error("Please wait for the model to finish its response!");
            } else {
              submitForm();
            }
          }
        }}
      />

        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-full p-1.5 h-fit text-white bg-purple-600 hover:bg-purple-700 border-purple-700 shadow-lg"
                disabled={isLoading}
              >
                <Sparkles size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 bg-[#23272e] border-[#2d3138] text-white"
              align="end"
            >
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <DropdownMenuItem 
                    key={index}
                    className={`flex items-center gap-2 ${action.color}`}
                    onClick={() => {
                      append({
                        role: "user",
                        content: action.action,
                      });
                    }}
                  >
                    <IconComponent className="size-4" />
                    <span>{action.title}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Button */}
          {onSearch && (
            <Button
              className="rounded-full p-1.5 h-fit text-white bg-orange-600 hover:bg-orange-700 border-orange-700 shadow-lg"
              onClick={(event) => {
                event.preventDefault();
                if (input.trim()) {
                  onSearch(input.trim());
                  setInput('');
                }
              }}
              disabled={isLoading || !input.trim()}
            >
              <Search size={14} />
            </Button>
          )}

          {/* Teach Button */}
          <Button
            className="rounded-full p-1.5 h-fit text-white bg-indigo-600 hover:bg-indigo-700 border-indigo-700 shadow-lg"
            onClick={(event) => {
              event.preventDefault();
              // Teach button functionality will be added later
              console.log("Teach button clicked");
            }}
            disabled={isLoading}
          >
            <GraduationCap size={14} />
          </Button>

          {/* Send/Stop Button */}
      {isLoading ? (
        <Button
              className="rounded-full p-1.5 h-fit text-white bg-red-600 hover:bg-red-700 border-red-700 shadow-lg"
          onClick={(event) => {
            event.preventDefault();
            stop();
          }}
        >
          <StopIcon size={14} />
        </Button>
      ) : (
        <Button
              className="rounded-full p-1.5 h-fit text-white bg-blue-600 hover:bg-blue-700 border-blue-700 shadow-lg"
          onClick={(event) => {
            event.preventDefault();
            submitForm();
          }}
          disabled={input.length === 0 || uploadQueue.length > 0}
        >
          <ArrowUpIcon size={14} />
        </Button>
      )}
        </div>
      </div>
      
    </div>
  );
}
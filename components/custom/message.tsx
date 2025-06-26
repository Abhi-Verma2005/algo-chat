// message.tsx (updated - key changes only)
"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";

// Import all your components
import { Weather } from "./weather";
import { AuthorizePayment } from "../flights/authorize-payment";
import { DisplayBoardingPass } from "../flights/boarding-pass";
import { CreateReservation } from "../flights/create-reservation";
import { FlightStatus } from "../flights/flight-status";
import { ListFlights } from "../flights/list-flights";
import { SelectSeats } from "../flights/select-seats";
import { VerifyPayment } from "../flights/verify-payment";
import DSAProgressDashboard from "../dsa/Progress";
import CompactQuestionsViewer from "../dsa/Questions";
import { useSidebar } from "@/contexts/SidebarProvider";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  const { setSidebarContent } = useSidebar();

  // Function to get component and show in sidebar
  const showInSidebar = (toolName: string, result: any) => {
    let component = null;

    switch (toolName) {
      case "getWeather":
        component = <Weather weatherAtLocation={result} />;
        break;
      case "displayFlightStatus":
        component = <FlightStatus flightStatus={result} />;
        break;
      case "searchFlights":
        component = <ListFlights chatId={chatId} results={result} />;
        break;
      case "selectSeats":
        component = <SelectSeats chatId={chatId} availability={result} />;
        break;
      case "createReservation":
        if (!Object.keys(result).includes("error")) {
          component = <CreateReservation reservation={result} />;
        }
        break;
      case "authorizePayment":
        component = <AuthorizePayment intent={result} />;
        break;
      case "getFilteredQuestionsToSolve":
        component = <CompactQuestionsViewer data={result} />;
        break;
      case "getUserProgressOverview":
        component = <DSAProgressDashboard data={result} />;
        break;
      case "displayBoardingPass":
        component = <DisplayBoardingPass boardingPass={result} />;
        break;
      case "verifyPayment":
        component = <VerifyPayment result={result} />;
        break;
      default:
        component = <div>{JSON.stringify(result, null, 2)}</div>;
    }

    if (component) {
      setSidebarContent(component);
    }
  };

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-2">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    <button
                      onClick={() => showInSidebar(toolName, result)}
                      className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                    >
                      View {toolName.replace(/([A-Z])/g, ' $1').trim()} →
                    </button>
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm animate-pulse">
                      Loading {toolName}...
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
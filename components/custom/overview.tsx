import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, Code, Zap } from "lucide-react";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <Brain className="w-5 h-5" />
          <span>+</span>
          <Code className="w-5 h-5" />
          <span>=</span>
          <Zap className="w-5 h-5" />
        </p>
        <p>
          This is Odin, your AI-powered DSA learning companion. Get personalized explanations for 
          Data Structures & Algorithms concepts, instant code reviews, and adaptive learning paths 
          tailored to your skill level.
        </p>
        <p>
          Whether you&apos;re preparing for{" "}
          <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
            technical interviews
          </code>{" "}
          or just want to understand{" "}
          <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
            complex algorithms
          </code>
          , Odin provides 24/7 interactive tutoring that adapts to your learning style.
        </p>
        <p>
          Ready to master DSA? Start by asking about any concept - from basic arrays to 
          advanced dynamic programming. No question is too simple or complex for your AI tutor!
        </p>
      </div>
    </motion.div>
  );
};
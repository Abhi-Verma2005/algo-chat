import React, { useState } from 'react';
import { 
  CheckCircle, 
  ExternalLink, 
  Bookmark, 
  Code, 
  Trophy, 
  Filter,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Tooltip } from '@/components/ui/tooltip'; // Removed unused import

// Sample data structure
const SAMPLE_DATA = {
  questionsWithSolvedStatus: [
    {
      id: "1",
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "EASY" as const, // Add 'as const' to make it a literal type
      points: 4,
      leetcodeUrl: "https://leetcode.com/problems/two-sum/",
      isSolved: true,
      isBookmarked: false,
      questionTags: [{ name: "Array" }, { name: "Hash Table" }] // Changed from tags to questionTags
    },
    {
      id: "2", 
      title: "Add Two Numbers",
      slug: "add-two-numbers",
      difficulty: "MEDIUM" as const,
      points: 6,
      leetcodeUrl: "https://leetcode.com/problems/add-two-numbers/",
      isSolved: false,
      isBookmarked: true,
      questionTags: [{ name: "Linked List" }, { name: "Math" }] // Changed from tags to questionTags
    },
    {
      id: "3",
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters", 
      difficulty: "MEDIUM" as const,
      points: 6,
      leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      isSolved: false,
      isBookmarked: false,
      questionTags: [{ name: "Hash Table" }, { name: "String" }, { name: "Sliding Window" }] // Changed from tags to questionTags
    },
    {
      id: "4",
      title: "Median of Two Sorted Arrays",
      slug: "median-of-two-sorted-arrays",
      difficulty: "HARD" as const, 
      points: 8,
      leetcodeUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      isSolved: false,
      isBookmarked: false,
      questionTags: [{ name: "Array" }, { name: "Binary Search" }, { name: "Divide and Conquer" }] // Changed from tags to questionTags
    }
  ],
  individualPoints: 150,
  totalCount: 25,
  filters: {
    topics: ["Array", "Hash Table"],
    difficulties: ["EASY", "MEDIUM", "HARD"]
  }
};

interface Question {
  id: string;
  title: string;
  slug: string;
  difficulty: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERYHARD';
  points: number;
  leetcodeUrl: string;
  isSolved: boolean;
  isBookmarked: boolean;
  questionTags: QuestionTag[];
}

interface QuestionTag {
  name: string
}

interface QuestionsData {
  questionsWithSolvedStatus: Question[];
  individualPoints: number;
  totalCount: number;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'BEGINNER': return 'bg-green-950 text-green-400 border-green-800';
    case 'EASY': return 'bg-blue-950 text-blue-400 border-blue-800';
    case 'MEDIUM': return 'bg-yellow-950 text-yellow-400 border-yellow-800';
    case 'HARD': return 'bg-red-950 text-red-400 border-red-800';
    case 'VERYHARD': return 'bg-purple-950 text-purple-400 border-purple-800';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'BEGINNER': return '🌱';
    case 'EASY': return '🟢';
    case 'MEDIUM': return '🟡';
    case 'HARD': return '🔴';
    case 'VERYHARD': return '🟣';
    default: return '⚪';
  }
};

interface QuestionCardProps {
  question: Question;
  onDone?: (question: Question) => void;
  onCheck?: (question: Question) => void;
}

const QuestionCard = ({ question, onDone, onCheck }: QuestionCardProps) => {
  const [showTags, setShowTags] = useState(false);
  const [bookmarked, setBookmarked] = useState(question.isBookmarked);
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="bg-[#181A20]/90 backdrop-blur-md border border-[#23272e] rounded-2xl p-5 shadow-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {question.isSolved && (
              <CheckCircle className="size-4 text-green-400" />
            )}
            <button
              onClick={() => setBookmarked((b) => !b)}
              className={`rounded-full p-1 transition-colors ${bookmarked ? 'bg-blue-900/60' : 'bg-transparent'} hover:bg-blue-900/40`}
              aria-label="Bookmark"
            >
              <Bookmark className={`size-4 ${bookmarked ? 'text-blue-400' : 'text-zinc-500'}`} />
            </button>
          </div>

          <h4 className="text-base font-semibold text-white leading-tight mb-2 line-clamp-2">
            {question.title}
          </h4>

          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)} shadow-sm`}> 
              {getDifficultyIcon(question.difficulty)} {question.difficulty}
            </span>
            <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">
              +{question.points} pts
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDone?.(question)}
              className="text-xs h-8 px-3 rounded-full border-fuchsia-700 text-fuchsia-300 bg-fuchsia-900/20 hover:bg-fuchsia-900/40 hover:text-white"
            >
              Done
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => onCheck?.(question)}
              className="text-xs h-8 px-3 rounded-full border-sky-700 text-sky-300 bg-sky-900/20 hover:bg-sky-900/40 hover:text-white"
            >
              Check
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowHint((h) => !h)}
              className="text-xs h-8 px-3 rounded-full border-indigo-700 text-indigo-300 bg-indigo-900/20 hover:bg-indigo-900/40 hover:text-white"
            >
              Hint
            </Button>
            <a
              href={question.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                variant="default"
                className="text-xs h-8 px-3 rounded-full flex items-center gap-1 border-green-700 text-green-300 bg-green-900/20 hover:bg-green-900/40 hover:text-white"
                asChild
              >
                <span>
                  Solve
                  <ExternalLink className="size-3 inline ml-1" />
                </span>
              </Button>
            </a>
          </div>

          {/* Quick Hint Tooltip/Box */}
          {showHint && (
            <div className="bg-zinc-800 border border-indigo-700 text-indigo-200 rounded-xl p-3 mb-2 animate-fade-in">
              {/* Replace with actual hint logic or static text */}
              <span>Try breaking the problem into smaller subproblems and use a hash map for fast lookups!</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setShowTags(!showTags)}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {question.questionTags ? question.questionTags.length : 0} tags
              {showTags ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>
          </div>

          {showTags && (
            <div className="flex flex-wrap gap-2 mt-2">
              {question.questionTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[#23272e] text-blue-300 rounded-full text-xs border border-blue-800 shadow-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Update the main component to accept callbacks
interface CompactQuestionsViewerProps {
  data?: QuestionsData;
  onDone?: (question: Question) => void;
  onCheck?: (question: Question) => void;
}


const CompactQuestionsViewer = ({ 
  data = SAMPLE_DATA, 
  onDone, 
  onCheck 
}: CompactQuestionsViewerProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayQuestions = showAll ? data.questionsWithSolvedStatus : data.questionsWithSolvedStatus.slice(0, 3);
  
  const stats = {
    solved: data.questionsWithSolvedStatus.filter(q => q.isSolved).length,
    bookmarked: data.questionsWithSolvedStatus.filter(q => q.isBookmarked).length,
    total: data.questionsWithSolvedStatus.length
  };

  return (
    <div className="max-w-md mx-auto bg-background border border-border rounded-xl p-4 space-y-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Practice Questions</h3>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-foreground">{data.individualPoints}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-card rounded-lg p-2 border border-border">
          <div className="text-sm font-bold text-foreground">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="bg-card rounded-lg p-2 border border-border">
          <div className="text-sm font-bold text-green-400">{stats.solved}</div>
          <div className="text-xs text-muted-foreground">Solved</div>
        </div>
        <div className="bg-card rounded-lg p-2 border border-border">
          <div className="text-sm font-bold text-blue-400">{stats.bookmarked}</div>
          <div className="text-xs text-muted-foreground">Saved</div>
        </div>
      </div>

      {/* Filters */}
     

      {/* Questions */}
      <div className="space-y-3">
        {displayQuestions.map((question) => (
          <QuestionCard 
            key={question.id} 
            question={question} 
            onDone={onDone}
            onCheck={onCheck}
          />
        ))}
      </div>

      {/* Show More/Less */}
      {data.questionsWithSolvedStatus.length > 3 && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {showAll ? 'Show Less' : `Show ${data.questionsWithSolvedStatus.length - 3} More`}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Showing {displayQuestions.length} of {data.totalCount} questions
        </p>
      </div>
    </div>
  );
};

export default CompactQuestionsViewer;
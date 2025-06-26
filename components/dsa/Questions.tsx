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

// Sample data structure
const SAMPLE_DATA = {
  questionsWithSolvedStatus: [
    {
      id: "1",
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "EASY",
      points: 4,
      leetcodeUrl: "https://leetcode.com/problems/two-sum/",
      isSolved: true,
      isBookmarked: false,
      tags: ["Array", "Hash Table"]
    },
    {
      id: "2", 
      title: "Add Two Numbers",
      slug: "add-two-numbers",
      difficulty: "MEDIUM",
      points: 6,
      leetcodeUrl: "https://leetcode.com/problems/add-two-numbers/",
      isSolved: false,
      isBookmarked: true,
      tags: ["Linked List", "Math"]
    },
    {
      id: "3",
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters", 
      difficulty: "MEDIUM",
      points: 6,
      leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      isSolved: false,
      isBookmarked: false,
      tags: ["Hash Table", "String", "Sliding Window"]
    },
    {
      id: "4",
      title: "Median of Two Sorted Arrays",
      slug: "median-of-two-sorted-arrays",
      difficulty: "HARD", 
      points: 8,
      leetcodeUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      isSolved: false,
      isBookmarked: false,
      tags: ["Array", "Binary Search", "Divide and Conquer"]
    }
  ],
  userPoints: 150,
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

const QuestionCard = ({ question }: { question: Question }) => {
  const [showTags, setShowTags] = useState(false);
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:bg-accent/50 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {question.isSolved && (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
            {question.isBookmarked && (
              <Bookmark className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          <h4 className="text-sm font-semibold text-foreground leading-tight mb-2 line-clamp-2">
            {question.title}
          </h4>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
              {getDifficultyIcon(question.difficulty)} {question.difficulty}
            </span>
            <span className="text-xs font-bold text-green-400">
              +{question.points} pts
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowTags(!showTags)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {question.questionTags ? question.questionTags.length : 0} tags
              {showTags ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            <a
              href={question.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          {showTags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {question.questionTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs border border-border"
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

// @ts-expect-error: no need here
const CompactQuestionsViewer = ({ data = SAMPLE_DATA }: { data?: QuestionsData }) => {
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
          <QuestionCard key={question.id} question={question} />
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
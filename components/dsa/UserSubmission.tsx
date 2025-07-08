import React from 'react';
import { 
  Code, 
  Calendar, 
  Clock, 
  FileCode, 
  CheckCircle, 
  XCircle,
  Copy,
  ExternalLink,
  Sparkles,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserSubmissionData {
  found: boolean;
  questionSlug?: string;
  code?: string;
  language?: string;
  submissionStatus?: string;
  problemTitle?: string;
  createdAt?: string;
  updatedAt?: string;
  submissionId?: string;
  message?: string;
  error?: string;
}

interface UserSubmissionProps {
  data: UserSubmissionData;
}

const getLanguageIcon = (language: string) => {
  switch (language.toLowerCase()) {
    case 'javascript': return '🟨';
    case 'typescript': return '';
    case 'python': return '';
    case 'java': return '☕';
    case 'cpp': return '🔷';
    case 'c': return '';
    case 'csharp': return '🟣';
    case 'go': return '';
    case 'rust': return '🟠';
    case 'php': return '';
    case 'ruby': return '🔴';
    case 'swift': return '';
    case 'kotlin': return '🟠';
    default: return '📄';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 'wrong_answer':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'time_limit_exceeded':
      return <Clock className="w-5 h-5 text-orange-500" />;
    case 'runtime_error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <FileCode className="w-5 h-5 text-blue-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
      return 'text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800';
    case 'wrong_answer':
      return 'text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-800';
    case 'time_limit_exceeded':
      return 'text-orange-700 bg-orange-100 border-orange-200 dark:text-orange-300 dark:bg-orange-900/30 dark:border-orange-800';
    case 'runtime_error':
      return 'text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-800';
    default:
      return 'text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800';
  }
};

const getLanguageColor = (language: string) => {
  switch (language?.toLowerCase()) {
    case 'javascript': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    case 'typescript': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'python': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    case 'java': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    case 'cpp': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const UserSubmission = ({ data }: UserSubmissionProps) => {
  const copyToClipboard = async () => {
    if (data.code) {
      try {
        await navigator.clipboard.writeText(data.code);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  if (!data.found) {
    return (
      <div className="max-w-2xl mx-auto bg-gradient-to-br from-background to-muted/20 border border-border rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-muted rounded-lg">
            <Code className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Submission Not Found</h3>
        </div>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileCode className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-muted-foreground text-lg mb-3">
            {data.message || 'No submission found for this problem.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Make sure you&apos;ve submitted your solution on LeetCode with the extension enabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-br from-background to-muted/20 border border-border rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <Code className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              {data.problemTitle || data.questionSlug}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Submission ID: {data.submissionId}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={copyToClipboard}
          className="text-xs hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </Button>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors">
          <span className="text-xl">{getLanguageIcon(data.language || '')}</span>
          <div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLanguageColor(data.language || '')}`}>
              {data.language?.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors">
          {getStatusIcon(data.submissionStatus || '')}
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(data.submissionStatus || '')}`}>
            {data.submissionStatus?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        {data.createdAt && (
          <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">{formatDate(data.createdAt)}</span>
          </div>
        )}
        
        {data.updatedAt && data.updatedAt !== data.createdAt && (
          <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors">
            <Clock className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Updated: {formatDate(data.updatedAt)}</span>
          </div>
        )}
      </div>

      {/* Code Display */}
      <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-semibold text-foreground">
              Your Solution
            </span>
          </div>
          <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
            {data.code?.split('\n').length || 0} lines
          </span>
        </div>
        <div className="bg-background/80 rounded-lg p-4 border border-border/50">
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-words font-mono text-foreground leading-relaxed">
            <code>{data.code}</code>
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 bg-primary rounded-full"></span>
            Question: {data.questionSlug}
          </span>
          <a
            href={`https://leetcode.com/problems/${data.questionSlug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors hover:bg-primary/10 px-2 py-1 rounded-md"
          >
            View on LeetCode
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserSubmission; 
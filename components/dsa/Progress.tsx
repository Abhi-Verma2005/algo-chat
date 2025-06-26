import React from 'react';
import { Trophy, Target, Code, CheckCircle, ExternalLink, TrendingUp } from 'lucide-react';

const SAMPLE_DATA = {
  "user": {
    "username": "Abhishek Verma",
    "leetcodeUsername": "Abhi_Verma2678",
    "enrollmentNum": "2401010023",
    "section": "A",
    "individualPoints": 80,
    "leetcodeQuestionsSolved": 63,
    "codeforcesQuestionsSolved": 0,
    "rank": "novice_1",
    "userBrief": "Just started focusing on DSA to build problem-solving skills for placements."
  },
  "overview": {
    "totalSolved": 27,
    "difficultyBreakdown": [
      { "difficulty": "BEGINNER", "solved": 15, "attempted": 15, "successRate": 100 },
      { "difficulty": "EASY", "solved": 11, "attempted": 11, "successRate": 100 },
      { "difficulty": "MEDIUM", "solved": 1, "attempted": 1, "successRate": 100 }
    ],
    "currentStreak": 0,
    "timeRange": "all"
  },
  "recentActivity": {
    "last30Days": [
      {
        "id": "1",
        "questionSlug": "find-the-student-that-will-replace-the-chalk",
        "difficulty": "MEDIUM",
        "points": 6,
        "createdAt": "2025-06-16T02:07:30.596Z",
        "leetcodeUrl": "https://leetcode.com/problems/find-the-student-that-will-replace-the-chalk/description/"
      },
      {
        "id": "2",
        "questionSlug": "linked-list-cycle-ii",
        "difficulty": "EASY",
        "points": 4,
        "createdAt": "2025-06-09T03:03:28.230Z",
        "leetcodeUrl": "https://leetcode.com/problems/linked-list-cycle-ii/description/"
      },
      {
        "id": "3",
        "questionSlug": "search-insert-position",
        "difficulty": "BEGINNER",
        "points": 2,
        "createdAt": "2025-06-07T11:18:34.832Z",
        "leetcodeUrl": "https://leetcode.com/problems/search-insert-position/description/"
      }
    ]
  }
};

const StatCard = ({ label, value, emoji }: { label: string, value: string, emoji: string }) => (
  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center hover:bg-gray-800 transition-all">
    <div className="text-lg font-black text-white">{value}</div>
    <div className="text-xs font-medium text-gray-400">{label} {emoji}</div>
  </div>
);

const DifficultyBar = ({ difficulty, solved, rate }: { difficulty: string, solved: number, rate: number }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="w-16 font-bold text-gray-300">{difficulty.slice(0,3)}</span>
    <div className="flex-1 bg-gray-800 rounded-full h-2 border border-gray-700">
      <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full" style={{width: `${rate}%`}}></div>
    </div>
    <span className="w-8 font-bold text-white">{solved}</span>
  </div>
);
//@ts-expect-error: no need here 
const ActivityItem = ({ activity }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-900 text-green-300 border-green-700';
      case 'EASY': return 'bg-blue-900 text-blue-300 border-blue-700';
      case 'MEDIUM': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'HARD': return 'bg-red-500 text-red-300 border-red-700';
      case 'VERYHARD': return 'bg-red-900 text-red-300 border-red-700';
      default: return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  const formatTitle = (slug: string) => {
    return slug.split('-').slice(0, 4).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') + (slug.split('-').length > 4 ? '...' : '');
  };

  const formatTimeAgo = (dateString: string): string => {
  const inputDate = new Date(dateString);
  const now = new Date();

  if (isNaN(inputDate.getTime())) return 'Invalid date';

  const diffMs = now.getTime() - inputDate.getTime();
  const days = Math.floor(diffMs / 86400000); // 1 day = 86,400,000 ms

  if (days < 0) return 'In the future';
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';

  return `${days}d ago`;
};

  return (
    <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold truncate text-white">{formatTitle(activity.questionSlug)}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(activity.difficulty)}`}>
            {activity.difficulty.slice(0,3)}
          </span>
          <span className="text-xs text-gray-400">{formatTimeAgo(activity.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <span className="text-xs font-bold text-green-400">+{activity.points}</span>
        <a href={activity.leetcodeUrl} target="_blank" rel="noopener noreferrer" 
           className="text-gray-400 hover:text-white transition-colors">
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default function CompactDSADashboard({ data = SAMPLE_DATA }) {
  const { user, overview, recentActivity } = data;

  return (
    <div className="max-w-md mx-auto bg-black border border-gray-800 rounded-2xl p-4 space-y-4 shadow-2xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-black mx-auto ring-2 ring-gray-700">
          {user.username.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h1 className="text-lg font-black text-white">{user.username}</h1>
          <div className="text-xs text-gray-400">@{user.leetcodeUsername} • Section {user.section}</div>
          <div className="inline-block bg-gray-800 px-2 py-1 rounded-full border border-gray-700 text-xs font-bold mt-1 text-green-400">
            🌱 Novice 1
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Points" value={user.individualPoints.toString()} emoji="✨" />
        <StatCard label="Problems Solved" value={overview.totalSolved.toString()} emoji="🎯" />
        <StatCard label="LeetCode" value={user.leetcodeQuestionsSolved.toString()} emoji="💻" />
        <StatCard label="Success Rate" value={"100%"} emoji="🎉" />
      </div>

      {/* Brief */}
      <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-300 leading-relaxed">{user.userBrief}</p>
      </div>

      {/* Difficulty Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-white">Difficulty Progress</h3>
        </div>
        <div className="space-y-2">
          {overview.difficultyBreakdown.map((item, index) => (
            <DifficultyBar 
              key={index}
              difficulty={item.difficulty}
              solved={item.solved}
              rate={item.successRate}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-white">Recent Activity</h3>
          <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-0.5 rounded-full">
            {recentActivity.last30Days.length} this month
          </span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {recentActivity.last30Days.slice(0, 3).map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Platform Link */}
      <div className="text-center">
        <a 
          href={`https://leetcode.com/${user.leetcodeUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg text-xs font-bold hover:from-gray-700 hover:to-gray-800 transition-all border border-gray-700"
        >
          <Code className="w-3 h-3" />
          View LeetCode Profile
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
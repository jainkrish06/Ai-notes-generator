import React, { useState } from 'react';
import {
  Sparkles,
  Edit3,
  Layers,
  HelpCircle,
  Download,
  Trash2,
  Bot,
  Clock,
  ChevronRight,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { ActivityItem, ActivityActionType } from '../types/note';

interface RecentActivityProps {
  activities: ActivityItem[];
  onSelectActivity?: (activity: ActivityItem) => void;
  onClearActivities?: () => void;
}

// Relative timestamp formatter
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 45) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onSelectActivity,
  onClearActivities,
}) => {
  const [filter, setFilter] = useState<'all' | 'notes' | 'study'>('all');

  const filtered = activities.filter((act) => {
    if (filter === 'notes') {
      return act.action === 'create_note' || act.action === 'update_note' || act.action === 'export_note';
    }
    if (filter === 'study') {
      return act.action === 'practice_flashcards' || act.action === 'complete_quiz';
    }
    return true;
  });

  const getActionBadge = (action: ActivityActionType) => {
    switch (action) {
      case 'create_note':
        return {
          icon: Sparkles,
          bgColor: 'bg-indigo-50 border-indigo-200 text-indigo-600',
          label: 'Created',
        };
      case 'update_note':
        return {
          icon: Edit3,
          bgColor: 'bg-amber-50 border-amber-200 text-amber-700',
          label: 'Edited',
        };
      case 'practice_flashcards':
        return {
          icon: Layers,
          bgColor: 'bg-violet-50 border-violet-200 text-violet-700',
          label: 'Flashcards',
        };
      case 'complete_quiz':
        return {
          icon: HelpCircle,
          bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          label: 'Quiz',
        };
      case 'export_note':
        return {
          icon: Download,
          bgColor: 'bg-sky-50 border-sky-200 text-sky-700',
          label: 'Exported',
        };
      case 'ask_assistant':
        return {
          icon: Bot,
          bgColor: 'bg-blue-50 border-blue-200 text-blue-700',
          label: 'AI Tutor',
        };
      case 'delete_note':
        return {
          icon: Trash2,
          bgColor: 'bg-rose-50 border-rose-200 text-rose-600',
          label: 'Deleted',
        };
      default:
        return {
          icon: Activity,
          bgColor: 'bg-slate-50 border-slate-200 text-slate-700',
          label: 'Action',
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Component Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
            <p className="text-xs text-slate-500">Track your ongoing learning momentum & revision timeline</p>
          </div>
        </div>

        {/* Filter Pills & Clear */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('notes')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'notes'
                  ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setFilter('study')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'study'
                  ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Study & Quiz
            </button>
          </div>

          {onClearActivities && activities.length > 0 && (
            <button
              onClick={onClearActivities}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Clear activity log"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="p-4 sm:p-5">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No recent activity recorded yet. Create or edit notes to track your progress!
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.slice(0, 8).map((act) => {
              const badge = getActionBadge(act.action);
              const Icon = badge.icon;
              const isClickable = Boolean(onSelectActivity && act.targetId);

              return (
                <div
                  key={act.id}
                  onClick={() => {
                    if (isClickable && onSelectActivity) {
                      onSelectActivity(act);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-3.5 transition group ${
                    isClickable
                      ? 'hover:border-indigo-200 hover:bg-slate-50/70 cursor-pointer'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Action Icon Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${badge.bgColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Title & Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition truncate">
                          {act.title}
                        </span>
                      </div>
                      {act.details && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {act.details}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timestamp & Navigation Arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      title={new Date(act.timestamp).toLocaleString()}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
                    >
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatRelativeTime(act.timestamp)}
                    </span>

                    {isClickable && (
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

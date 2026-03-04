import React, { useState, useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { LogEntry, Category, CATEGORIES } from '../../types';
import { formatDate } from '../../utils/time';

interface LogEditorProps {
  log: LogEntry;
  onSave: (updated: LogEntry) => void;
  onCancel: () => void;
  getCategoryColor: (cat: Category) => string;
}

/**
 * LogEditor Component
 * 编辑日志信息（描述、分类、标签等）
 * ~180 行 - 符合代码规范
 */
export const LogEditor: React.FC<LogEditorProps> = ({
  log,
  onSave,
  onCancel,
  getCategoryColor,
}) => {
  const [description, setDescription] = useState(log.description);
  const [category, setCategory] = useState(log.category);
  const [notes, setNotes] = useState(log.notes || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(log.tags || []);
  const [error, setError] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    const updated: LogEntry = {
      ...log,
      description: description.trim(),
      category,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 animate-in fade-in">
      <div className="w-full md:w-96 bg-white rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-in slide-in-from-bottom-5 md:slide-in-from-center md:zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-emerald-100 p-4 flex items-center justify-between rounded-t-3xl">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-emerald-100 rounded-lg transition-all text-emerald-600 active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-bold text-sm text-emerald-900 tracking-tight">Edit Log</h2>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-6">
          {/* Date Info (Read-only) */}
          <div>
            <p className="text-xs font-bold tracking-tight text-emerald-600 mb-2">
              Date
            </p>
            <p className="text-sm font-bold text-emerald-900 bg-emerald-50 p-3 rounded-lg tracking-tight">
              {formatDate(log.startTime)}
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <p className="text-xs font-bold tracking-tight text-emerald-600 mb-2">
              Category
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-lg font-bold text-xs transition-all text-white tracking-tight ${
                    category === cat ? 'ring-2 ring-offset-2 ring-emerald-300' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: getCategoryColor(cat),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold tracking-tight text-emerald-600 mb-2 block">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError('');
              }}
              maxLength={500}
              placeholder="What were you working on?"
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none resize-none font-medium text-emerald-900"
              rows={4}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-emerald-600 font-bold tracking-tight">
                {description.length} / 500 characters
              </p>
              {error && <p className="text-xs text-red-600 font-bold tracking-tight">{error}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold tracking-tight text-blue-600 mb-2 block">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={300}
              placeholder="Any additional notes..."
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none font-medium text-blue-900"
              rows={3}
            />
            <p className="text-xs text-blue-600 mt-2 font-bold tracking-tight">{notes.length} / 300 characters</p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-bold tracking-tight text-purple-600 mb-2 block">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none font-medium text-purple-900"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm transition-all active:scale-95 tracking-tight"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold tracking-tight"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-purple-900 transition-all font-bold tracking-tight"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-emerald-100 p-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all active:scale-95 tracking-tight"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 tracking-tight"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

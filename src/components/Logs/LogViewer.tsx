import React, { useState } from 'react';
import { ChevronLeft, Download, Share2, Trash2 } from 'lucide-react';
import { LogEntry, ColorTheme } from '../../types';
import { formatTime, formatDate, formatClock } from '../../utils/time';

interface LogViewerProps {
  log: LogEntry;
  categoryColor: string;
  onClose: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  activeTheme: ColorTheme;
}

/**
 * LogViewer Component
 * 显示日志详细信息，包含图片库
 * ~140 行 - 符合代码规范
 */
export const LogViewer: React.FC<LogViewerProps> = ({
  log,
  categoryColor,
  onClose,
  onDelete,
  onEdit,
  activeTheme,
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const selectedImage = log.images?.[selectedImageIdx];

  const baseColor = activeTheme.classes.bg.split(' ')[0].split('-').slice(1).join('-').split('/')[0];
  const primaryColorClass = `text-${baseColor.split('-')[0]}-600`;
  const surfaceClass = activeTheme.classes.surface;

  const handleDownload = () => {
    if (!selectedImage) return;

    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `log-${log.id}-${selectedImageIdx}.png`;
    link.click();
  };

  const handleShare = async () => {
    const text = `Logged: ${log.description}\nDuration: ${formatTime(log.duration)}\nCategory: ${log.category}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Activity Log',
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 animate-in fade-in">
      <div className={`w-full md:w-96 ${surfaceClass} rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-in slide-in-from-bottom-5 md:slide-in-from-center md:zoom-in-95`}>
        {/* Header */}
        <div className={`sticky top-0 ${surfaceClass} border-b ${activeTheme.classes.border.split('/')[0]} p-4 flex items-center justify-between rounded-t-3xl`}>
          <button
            onClick={onClose}
            className={`p-2 hover:${activeTheme.classes.bg.split(' ')[0].split('/')[0]} rounded-lg transition-all ${primaryColorClass} active:scale-90`}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className={`font-bold text-sm text-${baseColor.split('-')[0]}-900 tracking-tight`}>Details</h2>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-6">
          {/* Image Gallery */}
          {log.images && log.images.length > 0 && (
            <div className="space-y-3">
              {/* Main Image */}
              <div className={`relative ${activeTheme.classes.bg.split(' ')[0].split('/')[0]} rounded-xl overflow-hidden aspect-square`}>
                <img
                  src={selectedImage}
                  alt="log"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Controls */}
              <div className="flex gap-2 justify-center">
                {log.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden transition-all border-2 ${
                      idx === selectedImageIdx
                        ? `${activeTheme.classes.border.replace('border-', 'border-')} ring-2 ${activeTheme.classes.ring.replace('500', '300')}`
                        : `${activeTheme.classes.border.split('/')[0]} hover:${activeTheme.classes.border.split('/')[0].replace('100', '400')}`
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Image Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className={`flex-1 px-3 py-2 ${activeTheme.classes.bg.split(' ')[0].split('/')[0]} hover:${activeTheme.classes.bg.split(' ')[0].split('/')[0].replace('50', '200')} ${primaryColorClass} rounded-lg font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 tracking-tight`}
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 tracking-tight"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="space-y-4">
            {/* Category and Time */}
            <div className="space-y-2">
              <p className={`text-xs font-bold tracking-tight ${primaryColorClass}`}>
                Activity
              </p>
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-2 rounded-lg text-xs font-bold text-white tracking-tight"
                  style={{ backgroundColor: categoryColor }}
                >
                  {log.category}
                </span>
                <span className={`text-sm font-bold text-${baseColor.split('-')[0]}-900 tracking-tight`}>
                  {formatClock(log.startTime)} - {formatClock(log.endTime || Date.now())}
                </span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className={`text-xs font-bold tracking-tight ${primaryColorClass} mb-1`}>
                Duration
              </p>
              <p className={`text-lg font-bold text-${baseColor.split('-')[0]}-900 tracking-tight`}>{formatTime(log.duration)}</p>
            </div>

            {/* Date */}
            <div>
              <p className={`text-xs font-bold tracking-tight ${primaryColorClass} mb-1`}>
                Date
              </p>
              <p className={`text-sm font-bold text-${baseColor.split('-')[0]}-900 tracking-tight`}>{formatDate(log.startTime)}</p>
            </div>

            {/* Description */}
            {log.description && (
              <div>
                <p className={`text-xs font-bold tracking-tight ${primaryColorClass} mb-2`}>
                  Description
                </p>
                <p className={`text-sm text-${baseColor.split('-')[0]}-900 leading-relaxed ${activeTheme.classes.bg.split(' ')[0].split('/')[0]} p-3 rounded-lg`}>
                  {log.description}
                </p>
              </div>
            )}

            {/* Notes */}
            {log.notes && (
              <div>
                <p className={`text-xs font-bold tracking-tight ${primaryColorClass} mb-2`}>
                  Notes
                </p>
                <p className={`text-sm text-${baseColor.split('-')[0]}-900 leading-relaxed bg-blue-50 p-3 rounded-lg`}>
                  {log.notes}
                </p>
              </div>
            )}

            {/* Tags */}
            {log.tags && log.tags.length > 0 && (
              <div>
                <p className={`text-xs font-bold tracking-tight ${primaryColorClass} mb-2`}>
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {log.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold tracking-tight"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`sticky bottom-0 ${surfaceClass} border-t ${activeTheme.classes.border.split('/')[0]} p-4 flex gap-2`}>
          {onEdit && (
            <button
              onClick={onEdit}
              className={`flex-1 px-4 py-3 ${activeTheme.classes.bg.split(' ')[0].split('/')[0]} hover:${activeTheme.classes.bg.split(' ')[0].split('/')[0].replace('50', '200')} ${primaryColorClass} rounded-xl font-bold text-sm transition-all active:scale-95 tracking-tight`}
            >
              Edit
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex-1 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 tracking-tight"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

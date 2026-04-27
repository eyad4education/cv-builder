import { useRef, useState } from 'react';
import { Check, FileText, Pencil, Plus, Trash2, X } from 'lucide-react';

export function CVsTab({ cvs, activeCvId, onSelect, onAdd, onDelete, onRename, maxCVs }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const inputRef = useRef(null);

  function startRename(cv, e) {
    e.stopPropagation();
    setEditingId(cv.id);
    setEditName(cv.name);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function confirmRename(id) {
    if (editName.trim()) onRename(id, editName.trim());
    setEditingId(null);
  }

  function cancelRename() {
    setEditingId(null);
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">My CVs</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {cvs.length} / {maxCVs} CVs
            </p>
          </div>
          <button
            onClick={onAdd}
            disabled={cvs.length >= maxCVs}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Plus className="h-4 w-4" />
            New CV
          </button>
        </div>
      </div>

      {/* CV List */}
      <div className="flex-1 p-4 space-y-2 overflow-auto">
        {cvs.map((cv) => {
          const isActive = cv.id === activeCvId;
          const isEditing = editingId === cv.id;

          return (
            <div
              key={cv.id}
              onClick={() => !isEditing && onSelect(cv.id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                isActive
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-800 hover:shadow-sm'
              }`}
            >
              {/* Icon */}
              <div
                className={`flex-none w-9 h-9 rounded-lg flex items-center justify-center ${
                  isActive
                    ? 'bg-green-100 dark:bg-green-900/40'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                <FileText
                  className={`h-4 w-4 ${
                    isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
              </div>

              {/* Name / Edit input */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    ref={inputRef}
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRename(cv.id);
                      if (e.key === 'Escape') cancelRename();
                    }}
                    onBlur={() => confirmRename(cv.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-sm font-medium bg-transparent border-b-2 border-green-500 outline-none text-slate-900 dark:text-white pb-0.5"
                  />
                ) : (
                  <>
                    <span
                      className={`text-sm font-semibold truncate block ${
                        isActive
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {cv.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 flex-none" onClick={(e) => e.stopPropagation()}>
                {isEditing ? (
                  <>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); confirmRename(cv.id); }}
                      className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md transition-colors"
                      title="Confirm"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); cancelRename(); }}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => startRename(cv, e)}
                      className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors"
                      title="Rename"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(cv.id); }}
                      disabled={cvs.length <= 1}
                      className="p-1.5 rounded-md bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cap warning */}
      {cvs.length >= maxCVs && (
        <div className="mx-4 mb-4 p-3 text-xs text-center text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          Maximum of {maxCVs} CVs reached. Delete one to add another.
        </div>
      )}
    </div>
  );
}

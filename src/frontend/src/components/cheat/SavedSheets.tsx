import { BookOpen, FolderOpen, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { CheatSheet, CheatSheetInput } from "../../backend.d";
import {
  useAddSheet,
  useDeleteSheet,
  useGetAllSheets,
} from "../../hooks/useQueries";
import type { QAPair } from "../../utils/cheatTypes";

interface SavedSheetsProps {
  currentTitle: string;
  currentPairs: QAPair[];
  onLoadSheet: (sheet: CheatSheet) => void;
}

export function SavedSheets({
  currentTitle,
  currentPairs,
  onLoadSheet,
}: SavedSheetsProps) {
  const { data: sheets = [], isLoading } = useGetAllSheets();
  const addSheet = useAddSheet();
  const deleteSheet = useDeleteSheet();

  const handleSave = async () => {
    const title = currentTitle.trim() || `Sheet ${Date.now()}`;
    const content: CheatSheetInput["content"] = currentPairs
      .filter((p) => p.question.trim() || p.answer.trim())
      .map((p) => ({ question: p.question, answer: p.answer }));

    if (content.length === 0) {
      toast.error("Add at least one Q&A pair before saving.");
      return;
    }

    try {
      await addSheet.mutateAsync({ title, content });
      toast.success("Sheet saved successfully!");
    } catch {
      toast.error("Failed to save sheet. Try logging in.");
    }
  };

  const handleDelete = async (title: string) => {
    try {
      await deleteSheet.mutateAsync(title);
      toast.success("Sheet deleted.");
    } catch {
      toast.error("Failed to delete sheet.");
    }
  };

  const handleLoad = (sheet: CheatSheet) => {
    onLoadSheet(sheet);
    toast.success(`Loaded: ${sheet.title}`);
  };

  return (
    <section className="glass-panel p-4" aria-labelledby="saved-sheets-heading">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2
          id="saved-sheets-heading"
          className="text-sm font-bold flex items-center gap-2"
          style={{
            color: "var(--text-primary)",
            fontFamily: "'Bricolage Grotesque', sans-serif",
          }}
        >
          <BookOpen size={14} style={{ color: "#00ffff" }} />
          Saved Sheets
        </h2>

        <button
          type="button"
          className="neon-btn rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-2"
          onClick={handleSave}
          disabled={addSheet.isPending}
          aria-label="Save current sheet"
        >
          {addSheet.isPending ? (
            <span
              className="spinner-ring"
              style={{ width: 12, height: 12, borderWidth: 1.5 }}
            />
          ) : (
            <Upload size={12} />
          )}
          Save Sheet
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,255,255,0.04) 0%, rgba(191,0,255,0.06) 50%, rgba(0,255,255,0.04) 100%)",
                backgroundSize: "300% 100%",
                animation: "shimmer 1.8s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : sheets.length === 0 ? (
        <div
          className="text-center py-8 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <FolderOpen size={24} className="mx-auto mb-2 opacity-30" />
          No saved sheets yet. Create your first one above!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sheets.map((sheet) => (
            <div key={sheet.title} className="saved-sheet-item">
              <div className="min-w-0 flex-1">
                <div
                  className="text-xs font-semibold truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {sheet.title}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {sheet.content.length} pairs ·{" "}
                  {new Date(
                    Number(sheet.createdAt / 1_000_000n),
                  ).toLocaleDateString("en-IN")}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  className="neon-btn rounded px-2.5 py-1 text-xs font-semibold"
                  onClick={() => handleLoad(sheet)}
                  aria-label={`Load sheet: ${sheet.title}`}
                >
                  Load
                </button>
                <button
                  type="button"
                  className="neon-btn-purple neon-btn rounded p-1.5"
                  onClick={() => handleDelete(sheet.title)}
                  disabled={deleteSheet.isPending}
                  aria-label={`Delete sheet: ${sheet.title}`}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

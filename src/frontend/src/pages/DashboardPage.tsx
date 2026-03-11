import type { CheatSheet } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useDeleteSheet, useGetAllSheets } from "@/hooks/useQueries";
import {
  BookOpen,
  CalendarDays,
  Eye,
  Loader2,
  LogIn,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

function formatDate(createdAt: bigint): string {
  const ms = Number(createdAt / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function NoteModal({ note }: { note: CheatSheet }) {
  return (
    <DialogContent
      data-ocid="dashboard.modal"
      className="max-w-2xl max-h-[80vh] overflow-y-auto glass-card border-primary/20"
    >
      <DialogHeader>
        <DialogTitle className="font-display text-lg">{note.title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        {note.content.map((pair) => (
          <div key={pair.question}>
            <h3 className="font-display font-semibold text-primary text-sm uppercase tracking-wider mb-2">
              {pair.question}
            </h3>
            {pair.question === "Key Points" ||
            pair.question === "Cheat Notes" ? (
              <ul className="space-y-1">
                {pair.answer.split("\n").map((line) => (
                  <li
                    key={line.slice(0, 30)}
                    className="flex gap-2 text-sm text-foreground/85"
                  >
                    <span className="text-primary shrink-0">→</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : pair.question === "Diagram" ? (
              <pre className="font-mono text-xs bg-muted/20 p-3 rounded-lg overflow-x-auto border border-border/30 whitespace-pre-wrap">
                {pair.answer}
              </pre>
            ) : (
              <p className="text-foreground/80 text-sm leading-relaxed">
                {pair.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </DialogContent>
  );
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: sheets, isLoading } = useGetAllSheets();
  const deleteSheet = useDeleteSheet();
  const [viewNote, setViewNote] = useState<CheatSheet | null>(null);

  const handleDelete = async (title: string) => {
    try {
      await deleteSheet.mutateAsync(title);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (!identity) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center space-y-4">
          <BookOpen className="h-12 w-12 text-primary mx-auto" />
          <h2 className="font-display font-bold text-2xl">
            Your Notes Dashboard
          </h2>
          <p className="text-muted-foreground text-sm">
            Login with Internet Identity to save and access your notes from any
            device.
          </p>
          <Button
            data-ocid="dashboard.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-primary text-primary-foreground font-semibold"
          >
            {isLoggingIn ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4 mr-2" />
            )}
            Login with Internet Identity
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("/")}
            className="text-muted-foreground"
          >
            Continue without login
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl">My Notes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {sheets?.length ?? 0} saved{" "}
              {sheets?.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <Button
            data-ocid="dashboard.primary_button"
            onClick={() => onNavigate("/")}
            className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
            variant="outline"
          >
            + New Notes
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton has no stable key
              <div key={i} className="glass-card rounded-xl p-5 space-y-3">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
                <div className="skeleton h-8 w-full rounded mt-4" />
              </div>
            ))}
          </div>
        ) : !sheets?.length ? (
          <div
            data-ocid="dashboard.empty_state"
            className="glass-card rounded-2xl p-16 text-center border-dashed"
          >
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg mb-2">
              No notes yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Generate your first study notes to get started.
            </p>
            <Button
              onClick={() => onNavigate("/")}
              className="bg-primary text-primary-foreground"
            >
              Generate Notes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sheets.map((note, i) => (
              <div
                key={note.title}
                data-ocid={`dashboard.item.${i + 1}`}
                className="glass-card rounded-xl p-5 flex flex-col gap-3 hover:border-primary/25 transition-colors group"
              >
                <div className="flex-1">
                  <h3 className="font-display font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(note.createdAt)}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {note.content.length} sections
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    data-ocid={`dashboard.edit_button.${i + 1}`}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 hover:border-primary/40 hover:text-primary"
                    onClick={() => setViewNote(note)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                  <Button
                    data-ocid={`dashboard.delete_button.${i + 1}`}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(note.title)}
                    disabled={deleteSheet.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!viewNote}
        onOpenChange={(open) => !open && setViewNote(null)}
      >
        {viewNote && <NoteModal note={viewNote} />}
      </Dialog>
    </main>
  );
}

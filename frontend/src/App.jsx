import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CATEGORIES = ["Bug", "Feature Request", "UI/UX", "Performance"];

const categoryThemes = {
  Bug: {
    column: "border-rose-200 bg-rose-50/80",
    accent: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700",
    soft: "bg-rose-100/70 text-rose-700"
  },
  "Feature Request": {
    column: "border-sky-200 bg-sky-50/80",
    accent: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700",
    soft: "bg-sky-100/70 text-sky-700"
  },
  "UI/UX": {
    column: "border-violet-200 bg-violet-50/80",
    accent: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700",
    soft: "bg-violet-100/70 text-violet-700"
  },
  Performance: {
    column: "border-amber-200 bg-amber-50/80",
    accent: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800",
    soft: "bg-amber-100/70 text-amber-800"
  }
};

function ModalShell({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/60 bg-white shadow-[0_35px_90px_-40px_rgba(15,23,42,0.85)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-7">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
            {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-6 sm:px-7">{children}</div>
      </div>
    </div>
  );
}

function IdeaCard({ idea, onOpen }) {
  const theme = categoryThemes[idea.category] || categoryThemes["Feature Request"];

  return (
    <button
      type="button"
      onClick={() => onOpen(idea)}
      className="group relative w-full rounded-[28px] border border-white/70 bg-white p-5 text-left shadow-[0_16px_40px_-30px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-28px_rgba(15,23,42,0.9)]"
    >
      <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        {idea.votes}
      </div>

      <div className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${theme.badge}`}>
        {idea.category}
      </div>

      <div className="space-y-2">
        <h3 className="max-w-[88%] text-lg font-semibold leading-tight text-slate-950">
          {idea.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{idea.description}</p>
      </div>
    </button>
  );
}

function Column({ title, ideas, onOpenIdea }) {
  const theme = categoryThemes[title];

  return (
    <section className={`flex min-h-[26rem] flex-col rounded-[30px] border p-4 ${theme.column}`}>
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${theme.accent}`} />
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.soft}`}>
          {ideas.length}
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {ideas.length > 0 ? (
          ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} onOpen={onOpenIdea} />)
        ) : (
          <div className="flex h-full min-h-44 items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white/70 px-5 text-center text-sm text-slate-500">
            No ideas in {title} yet.
          </div>
        )}
      </div>
    </section>
  );
}

function IdeaDialog({ idea, isVoting, onUpvote, onClose }) {
  if (!idea) {
    return null;
  }

  const theme = categoryThemes[idea.category] || categoryThemes["Feature Request"];

  return (
    <ModalShell title={idea.title} subtitle="Idea details" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.badge}`}>
            {idea.category}
          </span>
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
            {idea.votes} votes
          </span>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm leading-7 text-slate-700">{idea.description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onUpvote(idea.id)}
            disabled={isVoting}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isVoting ? "Upvoting..." : "Upvote Idea"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function AddIdeaDialog({ isOpen, isSubmitting, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setError("Title and description are required.");
      return;
    }

    setError("");

    const created = await onSubmit({
      title: trimmedTitle,
      description: trimmedDescription
    });

    if (created) {
      onClose();
    }
  }

  return (
    <ModalShell
      title="Add New Idea"
      subtitle="Drop in the title and context. The backend will classify it."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Improve onboarding checklist"
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain the issue or opportunity in detail."
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </label>

        <div className="min-h-5 text-sm text-rose-600">{error}</div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Saving..." : "Submit Idea"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function App() {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingIdeaId, setVotingIdeaId] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [error, setError] = useState("");

  async function fetchIdeas() {
    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/ideas`);

      if (!response.ok) {
        throw new Error("Failed to load ideas.");
      }

      const data = await response.json();
      const safeIdeas = Array.isArray(data) ? data : [];
      setIdeas(safeIdeas);

      if (selectedIdea) {
        const refreshedIdea = safeIdeas.find((idea) => idea.id === selectedIdea.id) || null;
        setSelectedIdea(refreshedIdea);
      }
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load ideas.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchIdeas();
  }, []);

  async function handleCreateIdea(payload) {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/ideas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create idea.");
      }

      await fetchIdeas();
      return true;
    } catch (submitError) {
      setError(submitError.message || "Failed to create idea.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpvote(id) {
    try {
      setVotingIdeaId(id);
      setError("");

      const response = await fetch(`${API_BASE_URL}/ideas/${id}/upvote`, {
        method: "POST"
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upvote idea.");
      }

      await fetchIdeas();
    } catch (voteError) {
      setError(voteError.message || "Failed to upvote idea.");
    } finally {
      setVotingIdeaId(null);
    }
  }

  const ideasByCategory = CATEGORIES.reduce((grouped, category) => {
    grouped[category] = ideas
      .filter((idea) => idea.category === category)
      .sort((left, right) => right.votes - left.votes);
    return grouped;
  }, {});

  const totalIdeas = ideas.length;

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="flex min-h-screen w-full flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[34px] border border-white/60 bg-white/70 px-5 py-5 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.65)] backdrop-blur sm:px-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Idea Board
              </p>
              <div className="space-y-2">

                <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Open any card for full details, upvote promising ideas, and keep new submissions
                  flowing into the correct lane.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CATEGORIES.map((category) => (
                  <div
                    key={category}
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.9)]"
                  >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      {category}
                    </div>
                    <div className="mt-2 text-2xl font-semibold">
                      {ideasByCategory[category].length}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                + Add
              </button>
            </div>
          </div>
        </header>

        <div className="mb-4 min-h-6 text-sm text-rose-600">{error}</div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-[32px] border border-slate-200 bg-white/80 text-sm text-slate-500 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
            Loading ideas...
          </div>
        ) : (
          <main className="grid flex-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {CATEGORIES.map((category) => (
              <Column
                key={category}
                title={category}
                ideas={ideasByCategory[category]}
                onOpenIdea={setSelectedIdea}
              />
            ))}
          </main>
        )}

        {!isLoading && totalIdeas === 0 ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-8 mx-auto flex w-fit items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-5 py-3 text-sm text-slate-600 shadow-[0_22px_50px_-30px_rgba(15,23,42,0.6)] backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            No ideas yet. Add the first one to populate the board.
          </div>
        ) : null}
      </div>

      <IdeaDialog
        idea={selectedIdea}
        isVoting={votingIdeaId === selectedIdea?.id}
        onUpvote={handleUpvote}
        onClose={() => setSelectedIdea(null)}
      />

      <AddIdeaDialog
        isOpen={isAddOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreateIdea}
      />
    </div>
  );
}

export default App;

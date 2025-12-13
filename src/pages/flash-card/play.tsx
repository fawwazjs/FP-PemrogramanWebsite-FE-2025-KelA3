import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import Navbar from "@/components/ui/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  ArrowLeft,
  Check,
  X,
  RotateCcw,
  Trophy,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { type FlashCardItem } from "./types";

type FlashCardGame = {
  name: string;
  description: string;
  settings: {
    shuffle: boolean;
    score: number;
  };
  cards: FlashCardItem[];
};

function shuffleArray<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeGame(raw: any): FlashCardGame | null {
  const payload = raw?.data?.data ?? raw?.data ?? raw;

  if (!payload) return null;

  const name = String(payload.name ?? "");
  const description = String(payload.description ?? "");

  const shuffle = !!(payload.settings?.shuffle ?? payload.shuffle);
  const score = Number(payload.settings?.score ?? payload.score ?? 1);

  const cardsRaw = payload.cards ?? payload.flash_cards ?? payload.items ?? [];
  if (!Array.isArray(cardsRaw)) return null;

  const cards: FlashCardItem[] = cardsRaw.map((c: any) => ({
    question_type: c.question_type === "image" ? "image" : "text",
    question_text: c.question_text ?? null,
    question_image: c.question_image ?? null,
    back_type: c.back_type === "image" ? "image" : "text",
    answer_text: String(c.answer_text ?? ""),
    back_image: c.back_image ?? null,
    is_correct: !!c.is_correct,
  }));

  return {
    name,
    description,
    settings: { shuffle, score: Number.isFinite(score) ? score : 1 },
    cards,
  };
}

export default function FlashCardPlayPage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();

  const [game, setGame] = useState<FlashCardGame | null>(null);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [locked, setLocked] = useState(false);
  const [answered, setAnswered] = useState(false);

  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let alive = true;

    async function fetchGame() {
      if (!gameId) {
        if (!alive) return;
        setGame(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await api.get(`/api/game/game-type/flash-card/${gameId}`);
        const normalized = normalizeGame(res);

        if (!alive) return;

        if (!normalized || normalized.cards.length === 0) {
          setGame(null);
          setLoading(false);
          return;
        }

        const finalCards = normalized.settings.shuffle
          ? shuffleArray(normalized.cards)
          : normalized.cards;

        setGame({ ...normalized, cards: finalCards });

        setIndex(0);
        setIsFlipped(false);
        setLocked(false);
        setAnswered(false);

        setScore(0);
        setCorrectCount(0);
        setWrongCount(0);
        setFinished(false);

        setLoading(false);
      } catch {
        if (!alive) return;
        setGame(null);
        setLoading(false);
      }
    }

    fetchGame();
    return () => {
      alive = false;
    };
  }, [gameId]);

  const total = game?.cards?.length ?? 0;
  const card = game?.cards?.[index];
  const canRender = !!game && total > 0 && !!card && !loading;

  const handleExit = async () => {
    if (!gameId) {
      navigate("/");
      return;
    }

    try {
      await api.post(`/api/game/game-type/flash-card/${gameId}/play`);
    } catch {
      // tetap exit walau gagal increment play count
    } finally {
      navigate("/");
    }
  };

  const handleFlip = () => {
    if (finished) return;
    setIsFlipped((v) => !v);
  };

  const handleAnswer = (pick: "correct" | "wrong") => {
    if (!card || !game) return;
    if (locked || finished) return;

    setLocked(true);
    setAnswered(true);

    const isPickCorrect = pick === "correct";
    const isCardCorrect = !!card.is_correct;

    if (isPickCorrect === isCardCorrect) {
      setScore((s) => s + game.settings.score);
      setCorrectCount((c) => c + 1);
      toast.success("Correct!");
    } else {
      setWrongCount((w) => w + 1);
      toast.error("Wrong!");
    }

    if (index >= total - 1) {
      setTimeout(() => setFinished(true), 250);
    }
  };

  const handleNext = () => {
    if (!game) return;

    if (!answered) {
      toast.error("Jawab dulu sebelum Next.");
      return;
    }

    if (finished) return;

    setIsFlipped(false);
    setLocked(false);
    setAnswered(false);

    const nextIndex = index + 1;
    if (nextIndex >= total) {
      setFinished(true);
      return;
    }
    setIndex(nextIndex);
  };

  const handleRestart = () => {
    if (!game) return;

    const reshuffled = game.settings.shuffle
      ? shuffleArray(game.cards)
      : game.cards;

    setGame({ ...game, cards: reshuffled });

    setIndex(0);
    setIsFlipped(false);
    setLocked(false);
    setAnswered(false);

    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setFinished(false);
  };

  const handleBackToProjects = () => {
    navigate("/my-projects");
  };

  const bgClass =
    "min-h-screen relative overflow-hidden bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(255,140,64,0.35),transparent_60%),radial-gradient(1100px_650px_at_100%_40%,rgba(79,110,255,0.35),transparent_55%),linear-gradient(180deg,#0b1220_0%,#0a1020_60%,#0b1220_100%)]";

  const glassWrap =
    "rounded-[36px] border border-white/20 bg-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl";

  const smallGlass =
    "rounded-2xl border border-white/20 bg-white/10 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-xl";

  const flipSceneStyle: React.CSSProperties = {
    perspective: "1200px",
  };

  const flipCardStyle: React.CSSProperties = {
    transformStyle: "preserve-3d",
    transition: "transform 650ms cubic-bezier(0.2, 0.8, 0.2, 1)",
    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
  };

  const faceBaseStyle: React.CSSProperties = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  if (loading) {
    return (
      <div className={bgClass}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className={`${glassWrap} p-6`}>
            <Typography variant="h3" className="mb-2 text-white">
              Loading...
            </Typography>
            <Typography variant="muted" className="text-white/70">
              Sedang mengambil data game.
            </Typography>
          </div>
        </main>
      </div>
    );
  }

  if (!canRender) {
    return (
      <div className={bgClass}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className={`${glassWrap} p-6`}>
            <Typography variant="h3" className="mb-2 text-white">
              Tidak ada data Flash Card
            </Typography>
            <Typography variant="muted" className="mb-4 text-white/70">
              Game tidak ditemukan / belum punya card.
            </Typography>
            <Button onClick={() => navigate("/my-projects")}>
              Kembali ke My Projects
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={bgClass}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleExit}
            className="text-orange-200 hover:text-orange-100 hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit
          </Button>

          <div className="flex gap-3">
            <div className={`${smallGlass} px-4 py-3`}>
              <div className="text-xs text-white/70">Score</div>
              <div className="text-lg font-semibold text-white">{score}</div>
            </div>

            <div className={`${smallGlass} px-4 py-3`}>
              <div className="text-xs text-white/70">Progress</div>
              <div className="text-lg font-semibold text-white">
                {index + 1} / {total}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
          <div className={`${glassWrap} p-7`}>
            <div className="text-white/80 font-medium mb-4">
              {isFlipped ? "Belakang" : "Depan"}
            </div>

            <div style={flipSceneStyle}>
              <div className="relative w-full" style={flipCardStyle}>
                <div
                  className="w-full rounded-2xl border border-white/15 bg-white/15 backdrop-blur-xl p-10 flex items-center justify-center text-center min-h-[320px]"
                  style={faceBaseStyle}
                >
                  {card.question_type === "text" ? (
                    <div className="text-3xl font-bold text-white">
                      {card.question_text ?? ""}
                    </div>
                  ) : (
                    <img
                      src={card.question_image ?? ""}
                      className="max-h-[260px] object-contain mx-auto rounded-lg"
                      alt="front"
                    />
                  )}
                </div>

                <div
                  className="absolute inset-0 w-full rounded-2xl border border-white/15 bg-white/15 backdrop-blur-xl p-10 flex items-center justify-center text-center min-h-[320px]"
                  style={{
                    ...faceBaseStyle,
                    transform: "rotateY(180deg)",
                  }}
                >
                  {card.back_type === "text" ? (
                    <div className="text-2xl font-semibold text-white">
                      {card.answer_text ?? ""}
                    </div>
                  ) : (
                    <img
                      src={card.back_image ?? ""}
                      className="max-h-[260px] object-contain mx-auto rounded-lg"
                      alt="back"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleFlip}
                className="bg-white/10 border-white/20 text-white hover:bg-white/15"
              >
                Flip Card
              </Button>

              <Button
                variant="ghost"
                onClick={handleRestart}
                className="text-white/70 hover:text-white hover:bg-white/5"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`${smallGlass} p-4`}>
              <div className="text-white/70 text-sm mb-3">Jawaban</div>

              <div className="flex flex-col gap-4 items-center">
                <button
                  type="button"
                  disabled={locked || finished}
                  onClick={() => handleAnswer("wrong")}
                  className={[
                    "w-24 h-24 rounded-full flex items-center justify-center shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
                    "border border-white/15",
                    "bg-gradient-to-br from-red-500 to-rose-700",
                    locked || finished
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:scale-[1.03] active:scale-[0.99]",
                    "transition-transform",
                  ].join(" ")}
                  title="Wrong"
                >
                  <X className="w-9 h-9 text-white" />
                </button>

                <button
                  type="button"
                  disabled={locked || finished}
                  onClick={() => handleAnswer("correct")}
                  className={[
                    "w-24 h-24 rounded-full flex items-center justify-center shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
                    "border border-white/15",
                    "bg-gradient-to-br from-emerald-400 to-green-700",
                    locked || finished
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:scale-[1.03] active:scale-[0.99]",
                    "transition-transform",
                  ].join(" ")}
                  title="Correct"
                >
                  <Check className="w-10 h-10 text-white" />
                </button>
              </div>

              <div className="mt-5">
                <Button
                  onClick={handleNext}
                  className="w-full bg-white/15 hover:bg-white/20 text-white border border-white/15"
                  disabled={finished}
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="mt-2 text-xs text-white/55 text-center">
                  {answered ? "Sudah jawab — lanjut Next" : "Pilih Correct / Wrong"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {finished && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

            <div className={`relative w-full max-w-4xl ${glassWrap} p-10`}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-400/90 flex items-center justify-center shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                  <Trophy className="w-8 h-8 text-white" />
                </div>

                <div className="mt-5 text-4xl font-bold text-white">
                  Game Finished <span className="ml-1">🎉</span>
                </div>
                <div className="mt-2 text-white/70">{game?.name ?? "Flash Card"}</div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  <div className="rounded-2xl bg-white/10 border border-white/15 p-6 text-center">
                    <div className="text-white/70">Score</div>
                    <div className="text-4xl font-bold text-white mt-2">
                      {score}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/15 p-6 text-center">
                    <div className="text-white/70">Correct</div>
                    <div className="text-4xl font-bold text-white mt-2 flex items-center justify-center gap-2">
                      <Check className="w-7 h-7 text-emerald-300" />
                      {correctCount}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/15 p-6 text-center">
                    <div className="text-white/70">Wrong</div>
                    <div className="text-4xl font-bold text-white mt-2 flex items-center justify-center gap-2">
                      <X className="w-7 h-7 text-red-300" />
                      {wrongCount}
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={handleRestart}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>

                  <Button
                    onClick={handleBackToProjects}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Back to My Projects
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

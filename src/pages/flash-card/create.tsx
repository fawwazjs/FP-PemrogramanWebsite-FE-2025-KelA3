import { useState } from "react";
import Navbar from "@/components/ui/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlignLeft, Image as ImageIcon, ArrowLeftRight, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import { type FlashCardItem, type QuestionType } from "./types";

export default function FlashCardCreatePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [cards, setCards] = useState<FlashCardItem[]>([]);

  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [scorePerQuestion, setScorePerQuestion] = useState(1);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorList, setErrorList] = useState<string[]>([]);

  const addCard = () => {
    setCards((prev) => [
      ...prev,
      {
        question_type: "text",
        question_text: "",
        question_image: null,
        answer_text: "",
        back_type: "text",
        back_image: null,
        is_correct: false,
      },
    ]);
  };

  const removeCard = (idx: number) => {
    setCards((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCard = (idx: number, updated: Partial<FlashCardItem>) => {
    setCards((prev) => prev.map((card, i) => (i === idx ? { ...card, ...updated } : card)));
  };

  const swapFrontBack = (idx: number) => {
    const c = cards[idx];
    if (!c) return;

    const newQuestionType: QuestionType = c.back_type === "image" ? "image" : "text";
    const newBackType: "text" | "image" = c.question_type === "image" ? "image" : "text";

    const newCard: Partial<FlashCardItem> = {
      question_type: newQuestionType,
      question_text: c.back_type === "text" ? c.answer_text : "",
      question_image: c.back_type === "image" ? c.back_image : null,

      back_type: newBackType,
      back_image: c.question_type === "image" ? c.question_image : null,
      answer_text: c.question_type === "text" ? c.question_text ?? "" : "",
    };

    updateCard(idx, newCard);
  };

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setThumbnail(e.target.files[0]);
  };

  const handleFrontImageChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    updateCard(idx, {
      question_type: "image",
      question_image: previewUrl,
      question_text: "",
    });
  };

  const handleBackImageChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    updateCard(idx, {
      back_type: "image",
      back_image: previewUrl,
      answer_text: "",
    });
  };

  const validateForPublish = (): string[] => {
    const errors: string[] = [];

    if (!name.trim()) errors.push("Game Title is required.");
    if (!thumbnail) errors.push("Thumbnail image is required.");
    if (cards.length === 0) errors.push("At least one card is required.");

    cards.forEach((c, i) => {
      const idx = i + 1;

      if (c.question_type === "text") {
        if (!c.question_text || !c.question_text.trim()) errors.push(`Card ${idx}: sisi depan text kosong.`);
      } else if (c.question_type === "image") {
        if (!c.question_image) errors.push(`Card ${idx}: sisi depan image belum di-upload.`);
      }

      if (c.back_type === "text") {
        if (!c.answer_text || !c.answer_text.trim()) errors.push(`Card ${idx}: sisi belakang text kosong.`);
      } else if (c.back_type === "image") {
        if (!c.back_image) errors.push(`Card ${idx}: sisi belakang image belum di-upload.`);
      }
    });

    return errors;
  };

  const hasAnyContent = () => {
    if (name.trim() || description.trim() || thumbnail) return true;
    if (cards.length === 0) return false;

    return cards.some((c) => {
      const frontFilled =
        (c.question_type === "text" && c.question_text && c.question_text.trim() !== "") ||
        (c.question_type === "image" && !!c.question_image);

      const backFilled =
        (c.back_type === "text" && c.answer_text && c.answer_text.trim() !== "") ||
        (c.back_type === "image" && !!c.back_image);

      return frontFilled || backFilled;
    });
  };

  const buildPayload = () => ({
    name,
    description,
    thumbnail,
    settings: {
      shuffle: shuffleQuestions,
      score: scorePerQuestion,
    },
    cards,
  });

  const handleSaveDraft = () => {
    if (!hasAnyContent()) {
      toast.error("Isi minimal 1 field sebelum menyimpan draft.");
      return;
    }

    const payload = buildPayload();
    console.log("DRAFT PAYLOAD:", payload);
    toast.success("Draft tersimpan.");
  };

  const handlePublish = () => {
    const errors = validateForPublish();
    if (errors.length > 0) {
      setErrorList(errors);
      setErrorModalOpen(true);
      return;
    }

    const payload = buildPayload();
    console.log("PUBLISH PAYLOAD:", payload);
    toast.success("Publish berhasil.");
  };

  const handleCancel = () => {
    if (hasAnyContent() && !window.confirm("Perubahan akan hilang. Yakin ingin keluar?")) return;
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <div className="space-y-1">
            <p className="font-medium">
              Game Title <span className="text-red-500">*</span>
            </p>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Flash Cards: Example Topic" />
          </div>

          <div className="space-y-1">
            <p className="font-medium">Description (optional)</p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this flash card game..."
            />
          </div>

          <div className="space-y-1">
            <p className="font-medium">
              Thumbnail Image <span className="text-red-500">*</span>
            </p>

            <div className="border border-dashed rounded-xl p-6 text-center space-y-3">
              <input type="file" accept="image/*" onChange={handleThumbnail} className="hidden" id="thumb" />
              <label
                htmlFor="thumb"
                className="cursor-pointer px-4 py-2 bg-slate-100 rounded-md hover:bg-slate-200 inline-flex items-center justify-center"
              >
                Choose File
              </label>
              {thumbnail && <p className="text-sm text-slate-600">{thumbnail.name}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <div className="flex justify-between items-center">
            <p className="font-medium text-lg">
              Cards ({cards.length}) <span className="text-red-500">*</span>
            </p>
            <Button type="button" variant="outline" onClick={addCard}>
              Add Card
            </Button>
          </div>

          {cards.length === 0 && (
            <p className="text-slate-500 italic">Belum ada card. Klik &quot;Add Card&quot; untuk menambahkan.</p>
          )}

          <div className="space-y-6">
            {cards.map((card, index) => {
              const frontId = `front-img-${index}`;
              const backId = `back-img-${index}`;

              return (
                <div
                  key={index}
                  className="rounded-3xl bg-sky-100/40 border border-white/40 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-2xl px-6 py-6 space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">Card {index + 1}</p>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => swapFrontBack(index)}
                        className="hover:bg-slate-100 text-slate-600 rounded-full"
                        title="Tukar sisi depan & belakang"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCard(index)}
                        className="hover:bg-red-50 text-red-500 rounded-full"
                        title="Hapus card"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 space-y-3">
                      <p className="font-medium">
                        Depan <span className="text-red-500">*</span>
                      </p>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={card.question_type === "text" ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            updateCard(index, {
                              question_type: "text",
                              question_text: card.question_text ?? "",
                              question_image: null,
                            })
                          }
                          className="flex items-center gap-1 h-8 rounded-full"
                        >
                          <AlignLeft className="w-3 h-3" />
                          Text
                        </Button>

                        <Button
                          type="button"
                          variant={card.question_type === "image" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateCard(index, { question_type: "image", question_text: "" })}
                          className="flex items-center gap-1 h-8 rounded-full"
                        >
                          <ImageIcon className="w-3 h-3" />
                          Image
                        </Button>
                      </div>

                      {card.question_type === "text" ? (
                        <Textarea
                          value={card.question_text ?? ""}
                          onChange={(e) => updateCard(index, { question_text: e.target.value })}
                          placeholder="Isi sisi depan kartu..."
                          className="bg-white/60 border-white/60"
                        />
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/60 bg-white/40 p-4 flex flex-col items-center justify-center min-h-[160px]">
                          <input
                            id={frontId}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFrontImageChange(index, e)}
                          />

                          {card.question_image ? (
                            <div className="flex flex-col items-center gap-3 w-full">
                              <img
                                src={card.question_image}
                                alt="Front Preview"
                                className="max-h-40 w-full object-contain rounded-md bg-white/70"
                              />
                              <label
                                htmlFor={frontId}
                                className="cursor-pointer text-xs px-3 py-1.5 rounded-full bg-slate-900 text-white"
                              >
                                Change Image
                              </label>
                            </div>
                          ) : (
                            <label htmlFor={frontId} className="flex flex-col items-center gap-2 cursor-pointer text-slate-700">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-medium">Click to upload image</span>
                            </label>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <p className="font-medium">
                        Belakang <span className="text-red-500">*</span>
                      </p>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={card.back_type === "text" ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            updateCard(index, {
                              back_type: "text",
                              answer_text: card.answer_text ?? "",
                              back_image: null,
                            })
                          }
                          className="flex items-center gap-1 h-8 rounded-full"
                        >
                          <AlignLeft className="w-3 h-3" />
                          Text
                        </Button>

                        <Button
                          type="button"
                          variant={card.back_type === "image" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateCard(index, { back_type: "image", answer_text: "" })}
                          className="flex items-center gap-1 h-8 rounded-full"
                        >
                          <ImageIcon className="w-3 h-3" />
                          Image
                        </Button>
                      </div>

                      {card.back_type === "text" ? (
                        <Textarea
                          value={card.answer_text}
                          onChange={(e) => updateCard(index, { answer_text: e.target.value })}
                          placeholder="Isi sisi belakang kartu..."
                          className="bg-white/60 border-white/60"
                        />
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/60 bg-white/40 p-4 flex flex-col items-center justify-center min-h-[160px]">
                          <input
                            id={backId}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleBackImageChange(index, e)}
                          />

                          {card.back_image ? (
                            <div className="flex flex-col items-center gap-3 w-full">
                              <img
                                src={card.back_image}
                                alt="Back Preview"
                                className="max-h-40 w-full object-contain rounded-md bg-white/70"
                              />
                              <label
                                htmlFor={backId}
                                className="cursor-pointer text-xs px-3 py-1.5 rounded-full bg-slate-900 text-white"
                              >
                                Change Image
                              </label>
                            </div>
                          ) : (
                            <label htmlFor={backId} className="flex flex-col items-center gap-2 cursor-pointer text-slate-700">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-medium">Click to upload image</span>
                            </label>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={card.is_correct}
                          onChange={(e) => updateCard(index, { is_correct: e.target.checked })}
                        />
                        <p className="text-sm text-slate-700">
                          Tandai card ini sebagai <span className="font-semibold">jawaban benar</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <p className="text-lg font-medium">Settings</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Shuffle Questions</p>
              <p className="text-sm text-slate-600">Acak pertanyaan yang akan ditampilkan.</p>
            </div>
            <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
          </div>

          <div className="space-y-2">
            <p className="font-medium">Score Per Question</p>
            <Input
              type="number"
              value={scorePerQuestion}
              onChange={(e) => setScorePerQuestion(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="relative z-10 flex justify-end gap-3 pb-12">
          <Button type="button" variant="outline" className="px-6 rounded-xl" onClick={handleCancel}>
            Cancel
          </Button>

          <Button type="button" variant="outline" className="px-6 rounded-xl" onClick={handleSaveDraft}>
            Save Draft
          </Button>

          <Button type="button" className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700" onClick={handlePublish}>
            Publish
          </Button>
        </div>
      </main>

      <AlertDialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unable to Publish</AlertDialogTitle>
            <AlertDialogDescription>
              Periksa kembali field berikut:
              <ul className="mt-3 list-disc list-inside text-red-600 space-y-1">
                {errorList.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setErrorModalOpen(false)}>OK</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

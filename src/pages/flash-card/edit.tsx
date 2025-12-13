import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/ui/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import FlashCardCreatePage from "./create";
import { type FlashCardGameDraft } from "./types";

const STORAGE_EDIT_PREFIX = "flashcard:game:";

export default function FlashCardEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const storageKey = useMemo(() => {
    if (!id) return null;
    return `${STORAGE_EDIT_PREFIX}${id}`;
  }, [id]);

  const [data, setData] = useState<FlashCardGameDraft | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!storageKey) {
      setNotFound(true);
      return;
    }

    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setNotFound(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as FlashCardGameDraft;
      setData(parsed);
      setNotFound(false);
    } catch {
      setNotFound(true);
    }
  }, [storageKey]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <Card className="p-6">
            <Typography variant="h3" className="mb-2">
              Data Flash Cards tidak ditemukan
            </Typography>
            <Typography variant="muted" className="mb-5">
              Tidak ada data tersimpan untuk ID ini. Pastikan kamu sudah publish/menyimpan data
              sebelumnya, atau tunggu backend selesai supaya edit bisa fetch dari server.
            </Typography>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button onClick={() => navigate("/create-flash-cards")}>
                Ke Create Flash Cards
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (!data) return null;

  const CreateAny = FlashCardCreatePage as unknown as React.ComponentType<any>;

  return <CreateAny mode="edit" initialData={data} />;
}

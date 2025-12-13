export type QuestionType = "text" | "image";
export type BackType = "text" | "image";

export type FlashCardItem = {
  question_type: QuestionType;
  question_text: string | null;
  question_image: string | null;

  back_type: BackType;
  answer_text: string;
  back_image: string | null;

  is_correct: boolean;
};

export type FlashCardGameDraft = {
  name: string;
  description: string;
  thumbnail: string | null;

  settings: {
    shuffle: boolean;
    score: number;
  };

  cards: FlashCardItem[];
};

export type FlashCardGame = FlashCardGameDraft & {
  id: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FlashCardGetResponse = {
  data: FlashCardGame;
};

export type FlashCardSaveResponse = {
  message: string;
  data: FlashCardGame;
};

// Prismaから生成される型に基づいた正確な型定義
export type Skill = {
  skill: {
    name: string;
  };
};

export type Engineer = {
  id: string;
  name: string;
  email: string;
  desiredPrice: number | null;
  availableFrom: string | null;
  description: string | null;
  status: string;
  role: string;
  isAvailable: boolean;
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

// 表示用の軽量な型
export type EngineerListItem = Pick<
  Engineer,
  'id' | 'name' | 'skills' | 'desiredPrice' | 'availableFrom' | 'status'
>; 
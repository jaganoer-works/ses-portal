// 案件管理用の型定義

export type Interaction = {
  id: string;
  projectId: string;
  engineerId: string;
  message: string;
  progress: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type Project = {
  id: string;
  title: string;
  price: number | null;
  periodStart: string;
  periodEnd: string;
  description: string | null;
  status: string;
  published: boolean;
  publishedAt: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  interactions?: Interaction[];
};

// 表示用の軽量な型
export type ProjectListItem = Pick<
  Project,
  'id' | 'title' | 'price' | 'periodStart' | 'periodEnd' | 'status' | 'published'
>;

// 新規作成・編集用の型
export type ProjectFormData = {
  title: string;
  price: number;
  periodStart: string;
  periodEnd: string;
  description: string;
  status: string;
  published: boolean;
}; 
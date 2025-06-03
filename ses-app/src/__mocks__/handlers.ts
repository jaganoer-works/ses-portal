import { http, HttpResponse } from 'msw'

// テスト用のモックデータ
const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin',
}

const mockProjects = [
  {
    id: '1',
    title: 'テスト案件1',
    description: 'テスト用の案件です',
    status: '募集中',
    price: 500000,
    periodStart: '2024-01-01T00:00:00.000Z',
    periodEnd: '2024-03-31T00:00:00.000Z',
    published: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

const mockEngineers = [
  {
    id: 'engineer-1',
    name: 'テストエンジニア',
    email: 'engineer@example.com',
    role: 'engineer',
    status: '稼働中',
    desiredPrice: 600000,
    isAvailable: true,
    skills: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

export const handlers = [
  // 認証関連
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: mockUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  }),

  // プロジェクト関連
  http.get('/api/projects', ({ request }) => {
    const url = new URL(request.url)
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return HttpResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    
    return HttpResponse.json(mockProjects)
  }),

  http.get('/api/projects/:id', ({ params, request }) => {
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return HttpResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    
    const project = mockProjects.find(p => p.id === params.id)
    if (!project) {
      return HttpResponse.json({ error: '案件が見つかりません' }, { status: 404 })
    }
    
    return HttpResponse.json(project)
  }),

  // エンジニア関連
  http.get('/api/engineers', ({ request }) => {
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return HttpResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    
    return HttpResponse.json(mockEngineers)
  }),

  http.get('/api/engineers/:id', ({ params, request }) => {
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return HttpResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    
    const engineer = mockEngineers.find(e => e.id === params.id)
    if (!engineer) {
      return HttpResponse.json({ error: '技術者が見つかりません' }, { status: 404 })
    }
    
    return HttpResponse.json(engineer)
  }),

  // ユーザー関連
  http.get('/api/users', ({ request }) => {
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return HttpResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    
    return HttpResponse.json([mockUser])
  }),

  // やりとり関連
  http.get('/api/interactions', ({ request }) => {
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return HttpResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    
    return HttpResponse.json([])
  }),
] 
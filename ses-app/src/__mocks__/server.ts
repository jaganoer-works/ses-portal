import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// MSWサーバーをハンドラーでセットアップ
export const server = setupServer(...handlers) 
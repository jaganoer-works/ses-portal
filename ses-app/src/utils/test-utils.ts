import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, createElement } from 'react'
import { useSession } from 'next-auth/react'

// SessionProviderのモック（JSXを使わない版）
const MockSessionProvider = ({ children }: { children: React.ReactNode }) => {
  return children
}

// カスタムレンダー関数
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: MockSessionProvider, ...options })

// テスト用の認証済みセッションモック
export const mockAuthenticatedSession = (role: string = 'admin', userId: string = 'test-user-id') => {
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
  mockUseSession.mockReturnValue({
    data: {
      user: {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: role,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
    update: jest.fn(),
  })
}

// テスト用の未認証セッションモック
export const mockUnauthenticatedSession = () => {
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
  mockUseSession.mockReturnValue({
    data: null,
    status: 'unauthenticated',
    update: jest.fn(),
  })
}

// セッションモックをリセット
export const resetSessionMock = () => {
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
  mockUseSession.mockReset()
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render } 
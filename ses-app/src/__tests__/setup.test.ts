/**
 * 基本的なセットアップテスト
 * テスト環境が正常に動作することを確認
 */

describe('テスト環境セットアップ', () => {
  test('Jestが正常に動作する', () => {
    expect(true).toBe(true)
  })

  test('jest-domマッチャーが利用可能', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello World'
    expect(element).toHaveTextContent('Hello World')
  })

  test('環境変数とモジュールモックが設定されている', () => {
    // Next.js navigationのモックが動作していることを確認
    const { useRouter } = require('next/navigation')
    const router = useRouter()
    expect(router.push).toBeDefined()
    expect(typeof router.push).toBe('function')
  })

  test('NextAuth.jsのモックが動作している', () => {
    const { useSession } = require('next-auth/react')
    const session = useSession()
    expect(session).toBeDefined()
    expect(session.status).toBe('unauthenticated')
  })
}) 
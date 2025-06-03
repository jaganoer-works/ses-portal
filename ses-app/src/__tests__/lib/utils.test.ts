/**
 * ユーティリティ関数単体テスト
 * src/lib/ の共通ユーティリティ関数をテスト
 */

import { NextResponse } from 'next/server'
import { apiError } from '@/lib/apiError'
import { HTTP_STATUS } from '@/lib/httpStatus'
import { toPrismaNull, fromPrismaNull } from '@/lib/prismaUtils'

// NextResponseのモック
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>

describe('ユーティリティ関数', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('HTTP_STATUS定数', () => {
    test('HTTPステータスコードが正しく定義されている', () => {
      expect(HTTP_STATUS.OK).toBe(200)
      expect(HTTP_STATUS.CREATED).toBe(201)
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401)
      expect(HTTP_STATUS.FORBIDDEN).toBe(403)
      expect(HTTP_STATUS.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS.CONFLICT).toBe(409)
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500)
    })

    test('全ての必要なステータスコードが定義されている', () => {
      // 成功系
      expect(typeof HTTP_STATUS.OK).toBe('number')
      expect(typeof HTTP_STATUS.CREATED).toBe('number')
      
      // クライアントエラー系
      expect(typeof HTTP_STATUS.BAD_REQUEST).toBe('number')
      expect(typeof HTTP_STATUS.UNAUTHORIZED).toBe('number')
      expect(typeof HTTP_STATUS.FORBIDDEN).toBe('number')
      expect(typeof HTTP_STATUS.NOT_FOUND).toBe('number')
      expect(typeof HTTP_STATUS.CONFLICT).toBe('number')
      
      // サーバーエラー系
      expect(typeof HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe('number')
    })
  })

  describe('apiError関数', () => {
    test('文字列エラーで正しいレスポンスを生成する', () => {
      const mockResponse = { json: 'mocked response' }
      mockNextResponse.json.mockReturnValue(mockResponse as any)

      const result = apiError('エラーメッセージ', HTTP_STATUS.BAD_REQUEST)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'エラーメッセージ' },
        { status: 400 }
      )
      expect(result).toBe(mockResponse)
    })

    test('Errorオブジェクトで正しいレスポンスを生成する', () => {
      const mockResponse = { json: 'mocked response' }
      mockNextResponse.json.mockReturnValue(mockResponse as any)

      const error = new Error('システムエラー')
      const result = apiError(error, HTTP_STATUS.INTERNAL_SERVER_ERROR)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: error },
        { status: 500 }
      )
      expect(result).toBe(mockResponse)
    })

    test('配列エラーで正しいレスポンスを生成する', () => {
      const mockResponse = { json: 'mocked response' }
      mockNextResponse.json.mockReturnValue(mockResponse as any)

      const errors = [
        { field: 'email', message: 'メールアドレスが無効です' },
        { field: 'password', message: 'パスワードは8文字以上にしてください' }
      ]
      const result = apiError(errors, HTTP_STATUS.BAD_REQUEST)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: errors },
        { status: 400 }
      )
      expect(result).toBe(mockResponse)
    })

    test('ステータス未指定時はデフォルト500を使用する', () => {
      const mockResponse = { json: 'mocked response' }
      mockNextResponse.json.mockReturnValue(mockResponse as any)

      const result = apiError('エラー')

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'エラー' },
        { status: 500 }
      )
      expect(result).toBe(mockResponse)
    })

    test('空文字列エラーでも正しく処理する', () => {
      const mockResponse = { json: 'mocked response' }
      mockNextResponse.json.mockReturnValue(mockResponse as any)

      const result = apiError('', HTTP_STATUS.BAD_REQUEST)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: '' },
        { status: 400 }
      )
      expect(result).toBe(mockResponse)
    })

    test('空配列エラーでも正しく処理する', () => {
      const mockResponse = { json: 'mocked response' }
      mockNextResponse.json.mockReturnValue(mockResponse as any)

      const result = apiError([], HTTP_STATUS.BAD_REQUEST)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: [] },
        { status: 400 }
      )
      expect(result).toBe(mockResponse)
    })
  })

  describe('toPrismaNull関数', () => {
    test('undefinedをnullに変換する', () => {
      const input = {
        name: 'テスト',
        email: undefined,
        age: 25,
        address: undefined
      }

      const result = toPrismaNull(input)

      expect(result).toEqual({
        name: 'テスト',
        email: null,
        age: 25,
        address: null
      })
    })

    test('nullはそのまま維持する', () => {
      const input = {
        name: 'テスト',
        email: null,
        age: 25
      }

      const result = toPrismaNull(input)

      expect(result).toEqual({
        name: 'テスト',
        email: null,
        age: 25
      })
    })

    test('空文字列・0・falseは維持する', () => {
      const input = {
        name: '',
        age: 0,
        isActive: false,
        description: undefined
      }

      const result = toPrismaNull(input)

      expect(result).toEqual({
        name: '',
        age: 0,
        isActive: false,
        description: null
      })
    })

    test('空オブジェクトを正しく処理する', () => {
      const input = {}
      const result = toPrismaNull(input)
      expect(result).toEqual({})
    })

    test('ネストしたオブジェクトは変換しない（第1レベルのみ）', () => {
      const input = {
        user: {
          name: 'テスト',
          email: undefined
        },
        count: undefined
      }

      const result = toPrismaNull(input)

      expect(result).toEqual({
        user: {
          name: 'テスト',
          email: undefined // ネストは変換されない
        },
        count: null
      })
    })
  })

  describe('fromPrismaNull関数', () => {
    test('nullをundefinedに変換する', () => {
      const input = {
        name: 'テスト',
        email: null,
        age: 25,
        address: null
      }

      const result = fromPrismaNull(input)

      expect(result).toEqual({
        name: 'テスト',
        email: undefined,
        age: 25,
        address: undefined
      })
    })

    test('undefinedはそのまま維持する', () => {
      const input = {
        name: 'テスト',
        email: undefined,
        age: 25
      }

      const result = fromPrismaNull(input)

      expect(result).toEqual({
        name: 'テスト',
        email: undefined,
        age: 25
      })
    })

    test('空文字列・0・falseは維持する', () => {
      const input = {
        name: '',
        age: 0,
        isActive: false,
        description: null
      }

      const result = fromPrismaNull(input)

      expect(result).toEqual({
        name: '',
        age: 0,
        isActive: false,
        description: undefined
      })
    })

    test('空オブジェクトを正しく処理する', () => {
      const input = {}
      const result = fromPrismaNull(input)
      expect(result).toEqual({})
    })

    test('ネストしたオブジェクトは変換しない（第1レベルのみ）', () => {
      const input = {
        user: {
          name: 'テスト',
          email: null
        },
        count: null
      }

      const result = fromPrismaNull(input)

      expect(result).toEqual({
        user: {
          name: 'テスト',
          email: null // ネストは変換されない
        },
        count: undefined
      })
    })
  })

  describe('Prismaユーティリティの相互変換', () => {
    test('toPrismaNull → fromPrismaNull で元に戻る', () => {
      const original = {
        name: 'テスト',
        email: undefined,
        age: 25,
        isActive: true
      }

      const toNull = toPrismaNull(original)
      const backToUndefined = fromPrismaNull(toNull)

      expect(backToUndefined).toEqual(original)
    })

    test('fromPrismaNull → toPrismaNull でnullが維持される', () => {
      const original = {
        name: 'テスト',
        email: null,
        age: 25,
        isActive: true
      }

      const toUndefined = fromPrismaNull(original)
      const backToNull = toPrismaNull(toUndefined)

      expect(backToNull).toEqual(original)
    })
  })

  describe('エッジケース・型安全性', () => {
    test('様々な型の値を正しく処理する', () => {
      const input = {
        str: 'test',
        num: 42,
        bool: true,
        date: new Date('2024-01-01'),
        arr: [1, 2, 3],
        obj: { nested: 'value' },
        undef: undefined,
        nullVal: null
      }

      const toNull = toPrismaNull(input)
      expect(toNull.undef).toBe(null)
      expect(toNull.nullVal).toBe(null)
      expect(toNull.str).toBe('test')
      expect(toNull.num).toBe(42)
      expect(toNull.bool).toBe(true)

      const fromNull = fromPrismaNull(toNull)
      expect(fromNull.undef).toBe(undefined)
      expect(fromNull.nullVal).toBe(undefined)
      expect(fromNull.str).toBe('test')
      expect(fromNull.num).toBe(42)
      expect(fromNull.bool).toBe(true)
    })
  })
}) 
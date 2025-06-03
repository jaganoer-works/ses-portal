/**
 * Loading コンポーネント単体テスト
 * src/components/ui/Loading.tsx の全機能をテスト
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Loading, PageLoading, CardSkeleton } from '@/components/ui/Loading'

describe('Loading', () => {
  describe('基本的なレンダリング', () => {
    test('デフォルト状態でレンダリング', () => {
      render(<Loading />)
      
      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
      // SVGスピナーの存在確認
      expect(document.querySelector('svg.animate-spin')).toBeInTheDocument()
    })

    test('カスタムテキストの表示', () => {
      render(<Loading text="データを取得中..." />)
      
      expect(screen.getByText('データを取得中...')).toBeInTheDocument()
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
    })

    test('テキストなしの場合', () => {
      render(<Loading text="" />)
      
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
    })
  })

  describe('variant プロパティ', () => {
    test('spinner variant（デフォルト）', () => {
      render(<Loading variant="spinner" text="スピナーテスト" />)
      
      expect(screen.getByText('スピナーテスト')).toBeInTheDocument()
      // SVGスピナーの存在確認
      const svg = document.querySelector('svg.animate-spin')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('animate-spin')
    })

    test('pulse variant', () => {
      render(<Loading variant="pulse" />)
      
      // パルスアニメーション要素の確認
      const pulseElement = document.querySelector('.animate-pulse')
      expect(pulseElement).toBeInTheDocument()
      
      // スケルトン要素の確認
      expect(document.querySelector('.bg-gray-200')).toBeInTheDocument()
      expect(document.querySelector('.bg-gray-100')).toBeInTheDocument()
    })

    test('dots variant', () => {
      render(<Loading variant="dots" text="ドットテスト" />)
      
      expect(screen.getByText('ドットテスト')).toBeInTheDocument()
      
      // アニメーションドットの確認
      const dots = document.querySelectorAll('.animate-bounce')
      expect(dots).toHaveLength(3)
      expect(dots[0]).toHaveClass('bg-accent', 'rounded-full')
    })
  })

  describe('size プロパティ', () => {
    test('sm サイズ', () => {
      render(<Loading size="sm" />)
      
      const svg = document.querySelector('svg.animate-spin')
      expect(svg).toHaveClass('w-4', 'h-4')
      
      const text = screen.getByText('読み込み中...')
      expect(text).toHaveClass('text-sm')
    })

    test('md サイズ（デフォルト）', () => {
      render(<Loading size="md" />)
      
      const svg = document.querySelector('svg.animate-spin')
      expect(svg).toHaveClass('w-8', 'h-8')
      
      const text = screen.getByText('読み込み中...')
      expect(text).toHaveClass('text-base')
    })

    test('lg サイズ', () => {
      render(<Loading size="lg" />)
      
      const svg = document.querySelector('svg.animate-spin')
      expect(svg).toHaveClass('w-12', 'h-12')
      
      const text = screen.getByText('読み込み中...')
      expect(text).toHaveClass('text-lg')
    })
  })

  describe('className プロパティ', () => {
    test('カスタムクラス名の適用', () => {
      render(<Loading className="custom-loading-class" />)
      
      const container = document.querySelector('.custom-loading-class')
      expect(container).toBeInTheDocument()
    })
  })

  describe('無効なvariant', () => {
    test('無効なvariantの場合はnullを返す', () => {
      // @ts-ignore - 意図的に無効な値をテスト
      const { container } = render(<Loading variant="invalid" />)
      
      expect(container.firstChild).toBeNull()
    })
  })
})

describe('PageLoading', () => {
  test('基本的なレンダリング', () => {
    render(<PageLoading />)
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveClass('min-h-screen', 'bg-base')
  })

  test('カスタムテキストの表示', () => {
    render(<PageLoading text="ページを読み込み中..." />)
    
    expect(screen.getByText('ページを読み込み中...')).toBeInTheDocument()
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
  })

  test('ページレイアウトクラスの確認', () => {
    render(<PageLoading />)
    
    const main = screen.getByRole('main')
    expect(main).toHaveClass('min-h-screen', 'bg-base', 'py-8', 'px-4')
    
    const container = main.querySelector('.container')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('mx-auto', 'max-w-6xl')
  })
})

describe('CardSkeleton', () => {
  test('デフォルト6枚のカードスケルトン', () => {
    render(<CardSkeleton />)
    
    const cards = document.querySelectorAll('.animate-pulse')
    expect(cards).toHaveLength(6)
  })

  test('カスタム枚数のカードスケルトン', () => {
    render(<CardSkeleton count={3} />)
    
    const cards = document.querySelectorAll('.animate-pulse')
    expect(cards).toHaveLength(3)
  })

  test('グリッドレイアウトクラスの確認', () => {
    render(<CardSkeleton />)
    
    const grid = document.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6')
  })

  test('カードスタイルの確認', () => {
    render(<CardSkeleton count={1} />)
    
    const card = document.querySelector('.animate-pulse')
    expect(card).toHaveClass('bg-card', 'border', 'border-gray-200', 'rounded-xl', 'shadow-sm', 'p-6')
    
    // スケルトン要素の確認
    expect(card?.querySelector('.bg-gray-200')).toBeInTheDocument()
    expect(card?.querySelectorAll('.bg-gray-100')).toHaveLength(4)
  })

  test('0枚の場合は空のグリッド', () => {
    render(<CardSkeleton count={0} />)
    
    const cards = document.querySelectorAll('.animate-pulse')
    expect(cards).toHaveLength(0)
    
    const grid = document.querySelector('.grid')
    expect(grid).toBeInTheDocument()
  })

  test('大量のカード数でも正常動作', () => {
    render(<CardSkeleton count={20} />)
    
    const cards = document.querySelectorAll('.animate-pulse')
    expect(cards).toHaveLength(20)
  })
}) 
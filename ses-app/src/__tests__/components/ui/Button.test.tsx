/**
 * Button コンポーネント単体テスト
 * src/components/ui/Button.tsx の全機能をテスト
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  test('基本的なレンダリング', () => {
    render(<Button>クリック</Button>)
    
    const button = screen.getByRole('button', { name: 'クリック' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('クリック')
  })

  test('variant プロパティの動作', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-accent')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border', 'border-gray-300')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-gray-700')
  })

  test('size プロパティの動作', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-sm')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-base')
  })

  test('isLoading状態の動作', () => {
    render(<Button isLoading>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('処理中...')
    expect(button.querySelector('svg')).toBeInTheDocument()
    expect(button.querySelector('.animate-spin')).toBeInTheDocument()
  })

  test('disabled状態の動作', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
  })

  test('onClick イベントの動作', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('disabled時はonClickが発火しない', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick} disabled>Disabled</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  test('isLoading時はonClickが発火しない', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick} isLoading>Loading</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  test('カスタムclassNameの適用', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  test('HTML button属性の継承', () => {
    render(
      <Button 
        type="submit" 
        data-testid="submit-button"
        aria-label="Submit form"
      >
        Submit
      </Button>
    )
    
    const button = screen.getByTestId('submit-button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })

  test('フォーカス可能性の確認', () => {
    render(<Button>Focusable</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    expect(button).toHaveFocus()
  })

  test('基本CSSクラスの存在確認', () => {
    render(<Button>Test</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
    expect(button).toHaveClass('font-medium', 'rounded-lg', 'transition-colors')
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2')
  })

  test('variant/sizeの組み合わせ', () => {
    render(<Button variant="outline" size="lg">Large Outline</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'border-gray-300') // outline
    expect(button).toHaveClass('px-6', 'py-3', 'text-base') // lg size
  })
}) 
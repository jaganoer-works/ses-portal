/**
 * Card 関連コンポーネント単体テスト
 * src/components/ui/Card.tsx の全機能をテスト
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  Card, 
  CardWithHeader, 
  LinkCard, 
  StatusCard, 
  EmptyStateCard 
} from '@/components/ui/Card'

// Next.js Link コンポーネントのモック
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('Card', () => {
  test('基本的なレンダリング', () => {
    render(<Card>Card Content</Card>)
    
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  test('デフォルトクラスの確認', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild as HTMLElement
    
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'border', 'border-gray-200', 'shadow-md', 'p-6')
  })

  describe('padding プロパティ', () => {
    test('padding="none"', () => {
      const { container } = render(<Card padding="none">Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).not.toHaveClass('p-4', 'p-6', 'p-8')
    })

    test('padding="sm"', () => {
      const { container } = render(<Card padding="sm">Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).toHaveClass('p-4')
    })

    test('padding="md"（デフォルト）', () => {
      const { container } = render(<Card padding="md">Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).toHaveClass('p-6')
    })

    test('padding="lg"', () => {
      const { container } = render(<Card padding="lg">Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).toHaveClass('p-8')
    })
  })

  describe('shadow プロパティ', () => {
    test('shadow="none"', () => {
      const { container } = render(<Card shadow="none">Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).not.toHaveClass('shadow-sm', 'shadow-md', 'shadow-lg')
    })

    test('shadow="sm"', () => {
      const { container } = render(<Card shadow="sm">Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).toHaveClass('shadow-sm')
    })

    test('shadow="md"（デフォルト）', () => {
      const { container } = render(<Card shadow="md">Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).toHaveClass('shadow-md')
    })

    test('shadow="lg"', () => {
      const { container } = render(<Card shadow="lg">Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).toHaveClass('shadow-lg')
    })
  })

  describe('border プロパティ', () => {
    test('border=true（デフォルト）', () => {
      const { container } = render(<Card border={true}>Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).toHaveClass('border', 'border-gray-200')
    })

    test('border=false', () => {
      const { container } = render(<Card border={false}>Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).not.toHaveClass('border', 'border-gray-200')
    })
  })

  describe('hover プロパティ', () => {
    test('hover=false（デフォルト）', () => {
      const { container } = render(<Card hover={false}>Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).not.toHaveClass('hover:shadow-lg', 'transition-shadow')
    })

    test('hover=true', () => {
      const { container } = render(<Card hover={true}>Content</Card>)
      const card = container.firstChild as HTMLElement
      
      expect(card).toHaveClass('hover:shadow-lg', 'transition-shadow', 'duration-200')
    })
  })

  test('カスタムclassNameの適用', () => {
    const { container } = render(<Card className="custom-card">Content</Card>)
    const card = container.firstChild as HTMLElement
    
    expect(card).toHaveClass('custom-card')
  })
})

describe('CardWithHeader', () => {
  test('基本的なレンダリング', () => {
    render(
      <CardWithHeader title="Card Title">
        Card Body Content
      </CardWithHeader>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Body Content')).toBeInTheDocument()
  })

  test('subtitleの表示', () => {
    render(
      <CardWithHeader title="Main Title" subtitle="Sub Title">
        Content
      </CardWithHeader>
    )
    
    expect(screen.getByText('Main Title')).toBeInTheDocument()
    expect(screen.getByText('Sub Title')).toBeInTheDocument()
  })

  test('actionsの表示', () => {
    const actions = <button>Action Button</button>
    
    render(
      <CardWithHeader title="Title" actions={actions}>
        Content
      </CardWithHeader>
    )
    
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
  })

  test('headerとbodyの分離確認', () => {
    const { container } = render(
      <CardWithHeader title="Header Title">
        Body Content
      </CardWithHeader>
    )
    
    // ヘッダー部分のスタイルクラス確認
    const headerDiv = container.querySelector('.border-b.border-gray-200.pb-4.mb-4')
    expect(headerDiv).toBeInTheDocument()
    expect(headerDiv).toContainElement(screen.getByText('Header Title'))
    
    // bodyコンテンツが別の場所にあることを確認
    expect(screen.getByText('Body Content')).toBeInTheDocument()
  })

  test('Cardプロパティの継承', () => {
    const { container } = render(
      <CardWithHeader title="Title" padding="lg" shadow="lg">
        Content
      </CardWithHeader>
    )
    
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('p-8', 'shadow-lg') // padding="lg", shadow="lg"
  })
})

describe('LinkCard', () => {
  test('内部リンクの基本レンダリング', () => {
    render(
      <LinkCard href="/internal-page">
        Link Card Content
      </LinkCard>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/internal-page')
    expect(link).not.toHaveAttribute('target')
    expect(screen.getByText('Link Card Content')).toBeInTheDocument()
  })

  test('外部リンクの設定', () => {
    render(
      <LinkCard href="https://example.com" external={true}>
        External Link Content
      </LinkCard>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('ホバー効果のクラス確認', () => {
    const { container } = render(
      <LinkCard href="/test">
        Content
      </LinkCard>
    )
    
    const card = container.querySelector('.bg-white')
    expect(card).toHaveClass('hover:shadow-lg', 'hover:border-accent/20', 'focus:ring-2', 'focus:ring-accent')
  })

  test('Cardプロパティの継承', () => {
    const { container } = render(
      <LinkCard href="/test" padding="sm" shadow="sm">
        Content
      </LinkCard>
    )
    
    const card = container.querySelector('.bg-white')
    expect(card).toHaveClass('p-4', 'shadow-sm')
  })
})

describe('StatusCard', () => {
  test('基本的なレンダリング', () => {
    render(
      <StatusCard status="Active">
        Status Card Content
      </StatusCard>
    )
    
    expect(screen.getByText('Status Card Content')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  describe('statusColor プロパティ', () => {
    test.each([
      ['green', 'bg-green-100', 'text-green-800'],
      ['blue', 'bg-blue-100', 'text-blue-800'],
      ['yellow', 'bg-yellow-100', 'text-yellow-800'],
      ['red', 'bg-red-100', 'text-red-800'],
      ['gray', 'bg-gray-100', 'text-gray-800']
    ])('statusColor="%s"', (color, bgClass, textClass) => {
      render(
        <StatusCard status="Test Status" statusColor={color as any}>
          Content
        </StatusCard>
      )
      
      const statusElement = screen.getByText('Test Status')
      expect(statusElement).toHaveClass(bgClass, textClass)
    })
  })

  test('デフォルトカラー（gray）', () => {
    render(
      <StatusCard status="Default">
        Content
      </StatusCard>
    )
    
    const statusElement = screen.getByText('Default')
    expect(statusElement).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  test('ステータス要素のスタイル確認', () => {
    render(
      <StatusCard status="Test">
        Content
      </StatusCard>
    )
    
    const statusElement = screen.getByText('Test')
    expect(statusElement).toHaveClass('inline-flex', 'px-2', 'py-1', 'text-xs', 'font-medium', 'rounded-full')
  })
})

describe('EmptyStateCard', () => {
  test('基本的なレンダリング', () => {
    render(
      <EmptyStateCard title="No Data" />
    )
    
    expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  test('すべてのプロパティを含むレンダリング', () => {
    const icon = <div data-testid="custom-icon">📋</div>
    const action = <button>Add Item</button>
    
    render(
      <EmptyStateCard 
        title="Empty State"
        description="No items found"
        icon={icon}
        action={action}
      />
    )
    
    expect(screen.getByText('Empty State')).toBeInTheDocument()
    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
  })

  test('descriptionなしの場合', () => {
    render(
      <EmptyStateCard title="Title Only" />
    )
    
    expect(screen.getByText('Title Only')).toBeInTheDocument()
    // descriptionが表示されていないことを確認
    expect(document.querySelector('.text-sub')).not.toBeInTheDocument()
  })

  test('iconなしの場合', () => {
    render(
      <EmptyStateCard title="No Icon" />
    )
    
    expect(screen.getByText('No Icon')).toBeInTheDocument()
    // アイコン用のdivが表示されていないことを確認
    expect(document.querySelector('.text-4xl')).not.toBeInTheDocument()
  })

  test('actionなしの場合', () => {
    render(
      <EmptyStateCard title="No Action" description="Just description" />
    )
    
    expect(screen.getByText('No Action')).toBeInTheDocument()
    expect(screen.getByText('Just description')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test('中央寄せレイアウトの確認', () => {
    const { container } = render(
      <EmptyStateCard title="Centered" />
    )
    
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('text-center', 'py-12')
  })

  test('タイトルのスタイル確認', () => {
    render(
      <EmptyStateCard title="Styled Title" />
    )
    
    const title = screen.getByText('Styled Title')
    expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-900', 'mb-2')
  })
}) 
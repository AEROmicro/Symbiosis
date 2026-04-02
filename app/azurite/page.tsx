'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BlueprintEditor } from '@/components/blueprint-editor'
import {
  type WidgetConfig,
  DEFAULT_WIDGET_LAYOUT,
  PAGES_STORAGE_KEY,
  WIDGET_LAYOUT_KEY,
  CURRENT_PAGE_KEY,
} from '@/lib/widget-types'

type Page = { id: string; name: string; layout: WidgetConfig[] }

export default function AzuritePage() {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [currentPageId, setCurrentPageId] = useState<string>('')
  const [layout, setLayout] = useState<WidgetConfig[]>(DEFAULT_WIDGET_LAYOUT)
  const [mounted, setMounted] = useState(false)

  // Load layout state from localStorage on mount
  useEffect(() => {
    try {
      const storedPages = localStorage.getItem(PAGES_STORAGE_KEY)
      const storedCurrentPage = localStorage.getItem(CURRENT_PAGE_KEY)
      const storedLayout = localStorage.getItem(WIDGET_LAYOUT_KEY)

      if (storedPages) {
        const parsed: Page[] = JSON.parse(storedPages)
        if (parsed.length > 0) {
          const activeId = storedCurrentPage ?? parsed[0].id
          const activePage = parsed.find(p => p.id === activeId) ?? parsed[0]
          setPages(parsed)
          setCurrentPageId(activePage.id)
          setLayout(activePage.layout ?? DEFAULT_WIDGET_LAYOUT)
          setMounted(true)
          return
        }
      }

      // No pages — use legacy single layout
      if (storedLayout) {
        setLayout(JSON.parse(storedLayout) as WidgetConfig[])
      }
    } catch { /* ignore */ }
    setMounted(true)
  }, [])

  const handleSave = (newLayout: WidgetConfig[]) => {
    try {
      if (pages.length > 0) {
        const updated = pages.map(p => p.id === currentPageId ? { ...p, layout: newLayout } : p)
        localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(updated))
      } else {
        localStorage.setItem(WIDGET_LAYOUT_KEY, JSON.stringify(newLayout))
      }
    } catch { /* ignore */ }
    router.push('/')
  }

  const handleClose = () => {
    router.push('/')
  }

  const handlePageChange = (id: string) => {
    const page = pages.find(p => p.id === id)
    if (!page) return
    setCurrentPageId(id)
    setLayout(page.layout ?? DEFAULT_WIDGET_LAYOUT)
    try { localStorage.setItem(CURRENT_PAGE_KEY, id) } catch { /* ignore */ }
  }

  const handleCreatePage = (name: string) => {
    const id = `page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newPage: Page = { id, name, layout: DEFAULT_WIDGET_LAYOUT }
    const updated = [...pages, newPage]
    setPages(updated)
    setCurrentPageId(id)
    setLayout(DEFAULT_WIDGET_LAYOUT)
    try {
      localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(updated))
      localStorage.setItem(CURRENT_PAGE_KEY, id)
    } catch { /* ignore */ }
  }

  const handleDeletePage = (id: string) => {
    if (pages.length <= 1) return
    const updated = pages.filter(p => p.id !== id)
    const newCurrentId = id === currentPageId ? updated[0].id : currentPageId
    const newPage = updated.find(p => p.id === newCurrentId)
    setPages(updated)
    if (id === currentPageId) {
      setCurrentPageId(newCurrentId)
      setLayout(newPage?.layout ?? DEFAULT_WIDGET_LAYOUT)
    }
    try {
      localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(updated))
      if (id === currentPageId) localStorage.setItem(CURRENT_PAGE_KEY, newCurrentId)
    } catch { /* ignore */ }
  }

  if (!mounted) return null

  return (
    <BlueprintEditor
      pageMode
      open={true}
      onClose={handleClose}
      layout={layout}
      onLayoutChange={handleSave}
      pages={pages.length > 0 ? pages : undefined}
      currentPageId={currentPageId || undefined}
      onPageChange={handlePageChange}
      onCreatePage={handleCreatePage}
      onDeletePage={handleDeletePage}
    />
  )
}

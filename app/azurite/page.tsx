'use client'

import { useState } from 'react'
import { BlueprintEditor } from '@/components/blueprint-editor'
import { DEFAULT_WIDGET_LAYOUT } from '@/lib/widget-types'

export default function AzuritePage() {
  const [layout, setLayout] = useState(DEFAULT_WIDGET_LAYOUT)

  return (
    <BlueprintEditor
      open={true}
      onClose={() => {}}
      layout={layout}
      onLayoutChange={setLayout}
    />
  )
}

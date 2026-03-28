'use client'

import { Calculator } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalculatorWidget } from '@/components/widgets/calculator-widget'

export function CalculatorDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs font-mono"
        >
          <Calculator className="w-3 h-3" />
          Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs font-mono p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Calculator className="w-4 h-4 text-primary" />
            Calculator
          </DialogTitle>
        </DialogHeader>
        <div className="h-80">
          <CalculatorWidget />
        </div>
      </DialogContent>
    </Dialog>
  )
}

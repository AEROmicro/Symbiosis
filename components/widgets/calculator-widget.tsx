'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type CalcOp = '+' | '-' | '×' | '÷' | null

interface CalcState {
  display: string
  previous: number | null
  operator: CalcOp
  waitingForOperand: boolean
}

const initialState: CalcState = {
  display: '0',
  previous: null,
  operator: null,
  waitingForOperand: false,
}

function calculate(a: number, b: number, op: CalcOp): number {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '×': return a * b
    case '÷': return b !== 0 ? a / b : 0
    default: return b
  }
}

function formatDisplay(value: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  // Avoid scientific notation for reasonable ranges
  if (Math.abs(num) < 1e12 && Math.abs(num) >= 1e-6 || num === 0) {
    const formatted = parseFloat(num.toPrecision(10)).toString()
    return formatted.length > 12 ? num.toFixed(6).replace(/\.?0+$/, '') : formatted
  }
  return num.toExponential(4)
}

export function CalculatorWidget() {
  const [state, setState] = useState<CalcState>(initialState)

  const handleDigit = (digit: string) => {
    setState(prev => {
      if (prev.waitingForOperand) {
        return { ...prev, display: digit, waitingForOperand: false }
      }
      if (prev.display === '0' && digit !== '.') {
        return { ...prev, display: digit }
      }
      if (digit === '.' && prev.display.includes('.')) {
        return prev
      }
      return { ...prev, display: prev.display + digit }
    })
  }

  const handleOperator = (op: CalcOp) => {
    setState(prev => {
      const current = parseFloat(prev.display)
      if (prev.operator && !prev.waitingForOperand) {
        const result = calculate(prev.previous!, current, prev.operator)
        return {
          display: formatDisplay(result.toString()),
          previous: result,
          operator: op,
          waitingForOperand: true,
        }
      }
      return {
        ...prev,
        previous: current,
        operator: op,
        waitingForOperand: true,
      }
    })
  }

  const handleEquals = () => {
    setState(prev => {
      if (!prev.operator || prev.waitingForOperand) return prev
      const current = parseFloat(prev.display)
      const result = calculate(prev.previous!, current, prev.operator)
      return {
        display: formatDisplay(result.toString()),
        previous: null,
        operator: null,
        waitingForOperand: true,
      }
    })
  }

  const handleClear = () => setState(initialState)

  const handleToggleSign = () => {
    setState(prev => ({
      ...prev,
      display: formatDisplay((parseFloat(prev.display) * -1).toString()),
    }))
  }

  const handlePercent = () => {
    setState(prev => ({
      ...prev,
      display: formatDisplay((parseFloat(prev.display) / 100).toString()),
    }))
  }

  const isOp = (op: CalcOp) => state.operator === op && state.waitingForOperand

  const btnBase = 'flex items-center justify-center rounded font-mono text-sm font-medium transition-colors select-none cursor-pointer active:scale-95'
  const numBtn = cn(btnBase, 'bg-muted/60 hover:bg-muted text-foreground')
  const opBtn  = cn(btnBase, 'bg-primary/15 hover:bg-primary/25 text-primary')
  const opActive = cn(btnBase, 'bg-primary text-primary-foreground')
  const fnBtn  = cn(btnBase, 'bg-muted/40 hover:bg-muted/70 text-muted-foreground')
  const eqBtn  = cn(btnBase, 'bg-primary hover:bg-primary/90 text-primary-foreground')

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Display */}
      <div className="bg-muted/30 border border-border rounded-md px-3 py-2 text-right shrink-0">
        <div className="text-[10px] text-muted-foreground font-mono h-3 mb-0.5">
          {state.previous !== null && state.operator
            ? `${state.previous} ${state.operator}`
            : ''}
        </div>
        <div className="text-xl font-bold font-mono text-foreground truncate">
          {state.display}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {/* Row 1 */}
        <button className={fnBtn} onClick={handleClear}>C</button>
        <button className={fnBtn} onClick={handleToggleSign}>±</button>
        <button className={fnBtn} onClick={handlePercent}>%</button>
        <button className={isOp('÷') ? opActive : opBtn} onClick={() => handleOperator('÷')}>÷</button>

        {/* Row 2 */}
        <button className={numBtn} onClick={() => handleDigit('7')}>7</button>
        <button className={numBtn} onClick={() => handleDigit('8')}>8</button>
        <button className={numBtn} onClick={() => handleDigit('9')}>9</button>
        <button className={isOp('×') ? opActive : opBtn} onClick={() => handleOperator('×')}>×</button>

        {/* Row 3 */}
        <button className={numBtn} onClick={() => handleDigit('4')}>4</button>
        <button className={numBtn} onClick={() => handleDigit('5')}>5</button>
        <button className={numBtn} onClick={() => handleDigit('6')}>6</button>
        <button className={isOp('-') ? opActive : opBtn} onClick={() => handleOperator('-')}>−</button>

        {/* Row 4 */}
        <button className={numBtn} onClick={() => handleDigit('1')}>1</button>
        <button className={numBtn} onClick={() => handleDigit('2')}>2</button>
        <button className={numBtn} onClick={() => handleDigit('3')}>3</button>
        <button className={isOp('+') ? opActive : opBtn} onClick={() => handleOperator('+')}>+</button>

        {/* Row 5 */}
        <button className={cn(numBtn, 'col-span-2')} onClick={() => handleDigit('0')}>0</button>
        <button className={numBtn} onClick={() => handleDigit('.')}>.</button>
        <button className={eqBtn} onClick={handleEquals}>=</button>
      </div>
    </div>
  )
}

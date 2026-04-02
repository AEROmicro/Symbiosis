'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Calculator, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

function LabeledInput({ label, value, onChange, placeholder, type = 'number', step }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; step?: string
}) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
      <Input className="h-8 text-xs font-mono" type={type} step={step} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

interface RetirementResult {
  projectedSavings: number
  monthlyIncome: number
  inflationAdjusted: number
  savingsGap: number
  extraMonthlyNeeded: number
  growthTable: { age: number; savings: number }[]
}

function calcRetirement(
  currentAge: number, retirementAge: number, currentSavings: number,
  monthlyContrib: number, annualReturn: number, inflationRate: number,
  targetMonthlyIncome: number, retirementYears: number,
): RetirementResult {
  const years = retirementAge - currentAge
  if (years <= 0) return { projectedSavings: currentSavings, monthlyIncome: 0, inflationAdjusted: 0, savingsGap: 0, extraMonthlyNeeded: 0, growthTable: [] }

  const monthlyRate = annualReturn / 100 / 12
  const months = years * 12

  // Future value of current savings
  const fvSavings = currentSavings * Math.pow(1 + monthlyRate, months)

  // Future value of monthly contributions
  const fvContribs = monthlyRate > 0
    ? monthlyContrib * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    : monthlyContrib * months

  const projectedSavings = fvSavings + fvContribs

  // Monthly income from savings (4% rule annualized / 12)
  const monthlyIncome = (projectedSavings * 0.04) / 12

  // Inflation-adjusted value
  const inflationFactor = Math.pow(1 + inflationRate / 100, years)
  const inflationAdjusted = projectedSavings / inflationFactor

  // Required savings for target income
  const annualTargetIncome = targetMonthlyIncome * 12
  const requiredSavings = annualTargetIncome / 0.04
  const savingsGap = Math.max(0, requiredSavings - projectedSavings)

  // Extra monthly contribution needed to close gap
  let extraMonthlyNeeded = 0
  if (savingsGap > 0 && monthlyRate > 0) {
    extraMonthlyNeeded = savingsGap / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  } else if (savingsGap > 0) {
    extraMonthlyNeeded = savingsGap / months
  }

  // 5-year interval growth table
  const growthTable: { age: number; savings: number }[] = []
  for (let y = 0; y <= years; y += 5) {
    const m = y * 12
    const fvS = currentSavings * Math.pow(1 + monthlyRate, m)
    const fvC = monthlyRate > 0
      ? monthlyContrib * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate)
      : monthlyContrib * m
    growthTable.push({ age: currentAge + y, savings: fvS + fvC })
  }
  if (growthTable[growthTable.length - 1]?.age !== retirementAge) {
    growthTable.push({ age: retirementAge, savings: projectedSavings })
  }

  return { projectedSavings, monthlyIncome, inflationAdjusted, savingsGap, extraMonthlyNeeded, growthTable }
}

export function RetirementPlanner() {
  const [currentAge, setCurrentAge] = useState('30')
  const [retirementAge, setRetirementAge] = useState('65')
  const [currentSavings, setCurrentSavings] = useState('50000')
  const [monthlyContrib, setMonthlyContrib] = useState('500')
  const [annualReturn, setAnnualReturn] = useState('7')
  const [inflationRate, setInflationRate] = useState('3')
  const [targetIncome, setTargetIncome] = useState('5000')
  const [retirementYears, setRetirementYears] = useState('25')
  const [calculated, setCalculated] = useState(false)

  const result = useMemo<RetirementResult | null>(() => {
    if (!calculated) return null
    const ca = parseInt(currentAge)
    const ra = parseInt(retirementAge)
    const cs = parseFloat(currentSavings)
    const mc = parseFloat(monthlyContrib)
    const ar = parseFloat(annualReturn)
    const ir = parseFloat(inflationRate)
    const ti = parseFloat(targetIncome)
    const ry = parseInt(retirementYears)
    if ([ca, ra, cs, mc, ar, ir, ti, ry].some(isNaN) || ra <= ca) return null
    return calcRetirement(ca, ra, cs, mc, ar, ir, ti, ry)
  }, [calculated, currentAge, retirementAge, currentSavings, monthlyContrib, annualReturn, inflationRate, targetIncome, retirementYears])

  const maxSavings = result ? Math.max(...result.growthTable.map(r => r.savings), 1) : 1

  return (
    <div className="space-y-4 font-mono">
      {/* Inputs */}
      <Card>
        <SectionTitle>Your Information</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput label="Current Age" value={currentAge} onChange={v => { setCurrentAge(v); setCalculated(false) }} placeholder="30" />
          <LabeledInput label="Retirement Age" value={retirementAge} onChange={v => { setRetirementAge(v); setCalculated(false) }} placeholder="65" />
          <LabeledInput label="Current Savings ($)" value={currentSavings} onChange={v => { setCurrentSavings(v); setCalculated(false) }} placeholder="50000" />
          <LabeledInput label="Monthly Contribution ($)" value={monthlyContrib} onChange={v => { setMonthlyContrib(v); setCalculated(false) }} placeholder="500" />
          <LabeledInput label="Expected Return (%)" value={annualReturn} onChange={v => { setAnnualReturn(v); setCalculated(false) }} placeholder="7" step="0.1" />
          <LabeledInput label="Inflation Rate (%)" value={inflationRate} onChange={v => { setInflationRate(v); setCalculated(false) }} placeholder="3" step="0.1" />
          <LabeledInput label="Target Monthly Income ($)" value={targetIncome} onChange={v => { setTargetIncome(v); setCalculated(false) }} placeholder="5000" />
          <LabeledInput label="Years in Retirement" value={retirementYears} onChange={v => { setRetirementYears(v); setCalculated(false) }} placeholder="25" />
        </div>
        <Button className="w-full mt-4 font-mono" onClick={() => setCalculated(true)}>
          <Calculator className="w-4 h-4 mr-2" />Calculate Retirement Plan
        </Button>
      </Card>

      {result && (
        <>
          {/* Key Numbers */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Projected Savings</div>
              <div className="text-lg font-bold tabular-nums text-primary">{fmt(result.projectedSavings)}</div>
            </Card>
            <Card>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly Income</div>
              <div className="text-lg font-bold tabular-nums">{fmt(result.monthlyIncome)}</div>
              <div className="text-[10px] text-muted-foreground">4% withdrawal rule</div>
            </Card>
            <Card>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Inflation-Adjusted</div>
              <div className="text-lg font-bold tabular-nums">{fmt(result.inflationAdjusted)}</div>
              <div className="text-[10px] text-muted-foreground">In today's dollars</div>
            </Card>
          </div>

          {/* Savings Gap */}
          <Card>
            <SectionTitle>Savings Gap Analysis</SectionTitle>
            {result.savingsGap === 0 ? (
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>On track! Your projected savings exceed your target.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-500 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>You need {fmt(result.savingsGap)} more to meet your income goal.</span>
                </div>
                <div className="flex items-center justify-between text-xs border border-border rounded-sm px-3 py-2">
                  <span>Extra monthly contribution needed</span>
                  <span className="font-bold text-amber-500 tabular-nums">{fmt(result.extraMonthlyNeeded)}/mo</span>
                </div>
              </div>
            )}
          </Card>

          {/* Growth Table */}
          <Card>
            <SectionTitle>Savings Growth</SectionTitle>
            <div className="space-y-2">
              {result.growthTable.map(row => (
                <div key={row.age} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Age {row.age}</span>
                    <span className="font-bold tabular-nums">{fmt(row.savings)}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${(row.savings / maxSavings) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

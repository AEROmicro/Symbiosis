'use client'

import { useState, useMemo } from 'react'
import { Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type FilingStatus = 'single' | 'married' | 'hoh'

interface Bracket {
  rate: number
  min: number
  max: number
}

// 2024 Federal Tax Brackets
const BRACKETS: Record<FilingStatus, Bracket[]> = {
  single: [
    { rate: 0.10, min: 0,       max: 11600 },
    { rate: 0.12, min: 11600,   max: 47150 },
    { rate: 0.22, min: 47150,   max: 100525 },
    { rate: 0.24, min: 100525,  max: 191950 },
    { rate: 0.32, min: 191950,  max: 243725 },
    { rate: 0.35, min: 243725,  max: 609350 },
    { rate: 0.37, min: 609350,  max: Infinity },
  ],
  married: [
    { rate: 0.10, min: 0,       max: 23200 },
    { rate: 0.12, min: 23200,   max: 94300 },
    { rate: 0.22, min: 94300,   max: 201050 },
    { rate: 0.24, min: 201050,  max: 383900 },
    { rate: 0.32, min: 383900,  max: 487450 },
    { rate: 0.35, min: 487450,  max: 731200 },
    { rate: 0.37, min: 731200,  max: Infinity },
  ],
  hoh: [
    { rate: 0.10, min: 0,       max: 16550 },
    { rate: 0.12, min: 16550,   max: 63100 },
    { rate: 0.22, min: 63100,   max: 100500 },
    { rate: 0.24, min: 100500,  max: 191950 },
    { rate: 0.32, min: 191950,  max: 243700 },
    { rate: 0.35, min: 243700,  max: 609350 },
    { rate: 0.37, min: 609350,  max: Infinity },
  ],
}

const STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 14600,
  married: 29200,
  hoh: 21900,
}

const STATE_RATES: { label: string; rate: number }[] = [
  { label: 'No State Income Tax',    rate: 0 },
  { label: 'California (~9.3%)',     rate: 0.093 },
  { label: 'New York (~6.85%)',      rate: 0.0685 },
  { label: 'Texas (0%)',             rate: 0 },
  { label: 'Florida (0%)',           rate: 0 },
  { label: 'Illinois (4.95%)',       rate: 0.0495 },
  { label: 'Pennsylvania (3.07%)',   rate: 0.0307 },
  { label: 'Ohio (~3.99%)',          rate: 0.0399 },
  { label: 'Washington (0%)',        rate: 0 },
  { label: 'Massachusetts (5%)',     rate: 0.05 },
  { label: 'New Jersey (~5.53%)',    rate: 0.0553 },
]

function formatMoney(n: number, dec = 0) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: dec }).format(n)
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

interface TaxCalcResult {
  taxableIncome: number
  federalTax: number
  effectiveRate: number
  brackets: { rate: number; income: number; tax: number }[]
  stateTax: number
  totalTax: number
  monthlyWithholding: number
  takeHomePay: number
  ficaTax: number
}

export function TaxEstimator() {
  const [grossIncome, setGrossIncome] = useState('')
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single')
  const [additionalDeductions, setAdditionalDeductions] = useState('')
  const [mortgage, setMortgage] = useState('')
  const [charitable, setCharitable] = useState('')
  const [studentLoan, setStudentLoan] = useState('')
  const [stateRateIdx, setStateRateIdx] = useState(0)
  const [preRetirement, setPreRetirement] = useState('')

  const result = useMemo((): TaxCalcResult | null => {
    const income = parseFloat(grossIncome)
    if (!income || income <= 0) return null

    const stdDed = STANDARD_DEDUCTIONS[filingStatus]
    const itemizedDed = (parseFloat(mortgage) || 0) + (parseFloat(charitable) || 0) + (parseFloat(additionalDeductions) || 0)
    const slInterest = Math.min(parseFloat(studentLoan) || 0, 2500)
    const retirement401k = Math.min(parseFloat(preRetirement) || 0, 23000)
    const totalDeductions = Math.max(stdDed, itemizedDed) + slInterest + retirement401k

    const taxableIncome = Math.max(0, income - totalDeductions)
    const brackets = BRACKETS[filingStatus]

    let federalTax = 0
    const bracketBreakdown: { rate: number; income: number; tax: number }[] = []

    for (const b of brackets) {
      if (taxableIncome <= b.min) break
      const inBracket = Math.min(taxableIncome, b.max) - b.min
      const taxInBracket = inBracket * b.rate
      bracketBreakdown.push({ rate: b.rate, income: inBracket, tax: taxInBracket })
      federalTax += taxInBracket
    }

    const effectiveRate = income > 0 ? (federalTax / income) * 100 : 0

    // FICA: Social Security 6.2% up to $168,600, Medicare 1.45% + 0.9% over $200k
    const ssTax = Math.min(income, 168600) * 0.062
    const medicareTax = income * 0.0145 + (income > 200000 ? (income - 200000) * 0.009 : 0)
    const ficaTax = ssTax + medicareTax

    const stateTax = taxableIncome * STATE_RATES[stateRateIdx].rate

    const totalTax = federalTax + ficaTax + stateTax
    const monthlyWithholding = totalTax / 12
    const takeHomePay = income - totalTax

    return {
      taxableIncome,
      federalTax,
      effectiveRate,
      brackets: bracketBreakdown,
      stateTax,
      totalTax,
      monthlyWithholding,
      takeHomePay,
      ficaTax,
    }
  }, [grossIncome, filingStatus, additionalDeductions, mortgage, charitable, studentLoan, stateRateIdx, preRetirement])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="size-5 text-primary" />
          Tax Estimator
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">2024 US Federal tax estimate — for planning purposes only</p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <SectionTitle>Income</SectionTitle>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Gross Annual Income</label>
              <Input type="number" value={grossIncome} onChange={e => setGrossIncome(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="e.g. 75000" min="0" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Filing Status</label>
              <Select value={filingStatus} onValueChange={v => setFilingStatus(v as FilingStatus)}>
                <SelectTrigger className="h-8 text-xs mt-1 font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-mono text-xs">
                  <SelectItem value="single" className="text-xs">Single</SelectItem>
                  <SelectItem value="married" className="text-xs">Married Filing Jointly</SelectItem>
                  <SelectItem value="hoh" className="text-xs">Head of Household</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Standard Deduction: <span className="text-foreground">{formatMoney(STANDARD_DEDUCTIONS[filingStatus])}</span>
              </label>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">401k / Pre-Tax Retirement</label>
              <Input type="number" value={preRetirement} onChange={e => setPreRetirement(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="Max $23,000" min="0" max="23000" />
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>Deductions</SectionTitle>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Mortgage Interest</label>
              <Input type="number" value={mortgage} onChange={e => setMortgage(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="0" min="0" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Charitable Donations</label>
              <Input type="number" value={charitable} onChange={e => setCharitable(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="0" min="0" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Student Loan Interest (max $2,500)</label>
              <Input type="number" value={studentLoan} onChange={e => setStudentLoan(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="0" min="0" max="2500" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Other Itemized Deductions</label>
              <Input type="number" value={additionalDeductions} onChange={e => setAdditionalDeductions(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="0" min="0" />
            </div>
          </div>
        </Card>
      </div>

      {/* State Tax */}
      <Card>
        <SectionTitle>State Tax</SectionTitle>
        <Select value={String(stateRateIdx)} onValueChange={v => setStateRateIdx(parseInt(v))}>
          <SelectTrigger className="h-8 text-xs font-mono w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="font-mono text-xs">
            {STATE_RATES.map((s, i) => (
              <SelectItem key={i} value={String(i)} className="text-xs">{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Taxable Income',     value: formatMoney(result.taxableIncome),        color: 'text-foreground' },
              { label: 'Federal Tax',        value: formatMoney(result.federalTax),            color: 'text-red-400' },
              { label: 'Effective Rate',     value: `${result.effectiveRate.toFixed(1)}%`,     color: 'text-orange-400' },
              { label: 'Monthly Tax',        value: formatMoney(result.monthlyWithholding),    color: 'text-yellow-400' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="p-3">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={cn('text-lg font-bold tabular-nums', color)}>{value}</p>
              </Card>
            ))}
          </div>

          {/* Tax Breakdown Table */}
          <Card>
            <SectionTitle>Federal Tax Bracket Breakdown</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-muted-foreground py-1.5 pr-4">Rate</th>
                    <th className="text-right text-muted-foreground py-1.5 pr-4">Income in Bracket</th>
                    <th className="text-right text-muted-foreground py-1.5">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {result.brackets.map((b, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-1.5 pr-4">
                        <span className="text-primary font-semibold">{(b.rate * 100).toFixed(0)}%</span>
                      </td>
                      <td className="text-right py-1.5 pr-4 tabular-nums text-muted-foreground">{formatMoney(b.income)}</td>
                      <td className="text-right py-1.5 tabular-nums text-foreground">{formatMoney(b.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Full Summary */}
          <Card>
            <SectionTitle>Full Tax Summary</SectionTitle>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Gross Income',        value: formatMoney(parseFloat(grossIncome)), color: 'text-foreground' },
                { label: 'Federal Tax',         value: `− ${formatMoney(result.federalTax)}`, color: 'text-red-400' },
                { label: 'FICA (SS + Medicare)',value: `− ${formatMoney(result.ficaTax)}`,    color: 'text-red-400' },
                { label: 'State Tax',           value: `− ${formatMoney(result.stateTax)}`,   color: 'text-orange-400' },
                { label: 'Total Taxes',         value: `− ${formatMoney(result.totalTax)}`,   color: 'text-red-400', bold: true },
                { label: 'Est. Take-Home (Annual)', value: formatMoney(result.takeHomePay), color: 'text-green-400', bold: true },
                { label: 'Est. Take-Home (Monthly)', value: formatMoney(result.takeHomePay / 12), color: 'text-green-400' },
              ].map(({ label, value, color, bold }) => (
                <div key={label} className={cn('flex justify-between', bold && 'border-t border-border pt-2 font-semibold text-sm')}>
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn('tabular-nums', color)}>{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quarterly Estimated Tax */}
          <Card>
            <SectionTitle>Quarterly Estimated Tax (Self-Employed / 1099)</SectionTitle>
            <p className="text-xs text-muted-foreground mb-3">
              If you're self-employed, pay approximately {formatMoney(result.totalTax / 4)} per quarter to the IRS.
              Due dates: Apr 15, Jun 17, Sep 16, Jan 15.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Q1 (Apr 15)', 'Q2 (Jun 17)', 'Q3 (Sep 16)', 'Q4 (Jan 15)'].map(q => (
                <div key={q} className="bg-muted/30 rounded p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">{q}</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">{formatMoney(result.totalTax / 4)}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {!result && (
        <Card>
          <p className="text-xs text-muted-foreground text-center py-6">
            Enter your gross annual income above to see your estimated tax breakdown.
          </p>
        </Card>
      )}
    </div>
  )
}

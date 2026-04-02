'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Gem, LayoutDashboard, Receipt, PiggyBank, FileText, Target,
  CreditCard, Calculator, BookOpen, ArrowLeft, Menu, X,
  TrendingUp, Wallet, Landmark, Clock, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useThemeSync } from '@/hooks/use-theme-sync'
import { Overview }            from '@/components/tourmaline/overview'
import { ExpenseTracker }      from '@/components/tourmaline/expense-tracker'
import { BudgetPlanner }       from '@/components/tourmaline/budget-planner'
import { BillsTracker }        from '@/components/tourmaline/bills-tracker'
import { GoalsTracker }        from '@/components/tourmaline/goals-tracker'
import { CreditScore }         from '@/components/tourmaline/credit-score'
import { TaxEstimator }        from '@/components/tourmaline/tax-estimator'
import { LearnHub }            from '@/components/tourmaline/learn-hub'
import { DebtManager }         from '@/components/tourmaline/debt-manager'
import { InvestmentTracker }   from '@/components/tourmaline/investment-tracker'
import { RetirementPlanner }   from '@/components/tourmaline/retirement-planner'
import { SavingsPlanner }      from '@/components/tourmaline/savings-planner'
import { InsuranceTracker }    from '@/components/tourmaline/insurance-tracker'

type Section =
  | 'overview' | 'expenses' | 'budget' | 'bills' | 'goals'
  | 'credit' | 'tax' | 'learn'
  | 'debt' | 'investments' | 'retirement' | 'savings' | 'insurance'

const NAV_ITEMS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview',     label: 'Overview',       icon: LayoutDashboard },
  { id: 'expenses',     label: 'Expenses',        icon: Receipt         },
  { id: 'budget',       label: 'Budget',          icon: PiggyBank       },
  { id: 'bills',        label: 'Bills',           icon: FileText        },
  { id: 'goals',        label: 'Goals',           icon: Target          },
  { id: 'credit',       label: 'Credit Score',    icon: CreditCard      },
  { id: 'tax',          label: 'Tax Estimator',   icon: Calculator      },
  { id: 'learn',        label: 'Learn',           icon: BookOpen        },
  { id: 'debt',         label: 'Debt Manager',    icon: Wallet          },
  { id: 'investments',  label: 'Investments',     icon: TrendingUp      },
  { id: 'retirement',   label: 'Retirement',      icon: Clock           },
  { id: 'savings',      label: 'Savings Plan',    icon: Landmark        },
  { id: 'insurance',    label: 'Insurance',       icon: Shield          },
]

function SectionContent({ section }: { section: Section }) {
  switch (section) {
    case 'overview':    return <Overview />
    case 'expenses':    return <ExpenseTracker />
    case 'budget':      return <BudgetPlanner />
    case 'bills':       return <BillsTracker />
    case 'goals':       return <GoalsTracker />
    case 'credit':      return <CreditScore />
    case 'tax':         return <TaxEstimator />
    case 'learn':       return <LearnHub />
    case 'debt':        return <DebtManager />
    case 'investments': return <InvestmentTracker />
    case 'retirement':  return <RetirementPlanner />
    case 'savings':     return <SavingsPlanner />
    case 'insurance':   return <InsuranceTracker />
  }
}

export default function TourmalinePage() {
  const [active, setActive] = useState<Section>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useThemeSync()

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <Gem className="size-5 text-primary" />
              <span className="font-bold text-lg tracking-tight text-foreground">Tourmaline</span>
              <span className="hidden sm:inline text-xs text-muted-foreground px-2 py-0.5 bg-primary/10 border border-primary/20 rounded">
                Personal Finance
              </span>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
        {/* Scanline */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-52 border-r border-border bg-card/30 shrink-0">
          <nav className="flex flex-col gap-0.5 p-3 flex-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left w-full',
                  active === id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <p className="text-xs text-muted-foreground/60 text-center">All data stored locally</p>
          </div>
        </aside>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-14 bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border overflow-y-auto">
            <nav className="flex flex-col gap-1 p-4">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActive(id); setMobileMenuOpen(false) }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors text-left w-full',
                    active === id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <SectionContent section={active} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 flex">
        {NAV_ITEMS.slice(0, 5).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActive(id); setMobileMenuOpen(false) }}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors',
              active === id ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="size-4" />
            {label.split(' ')[0]}
          </button>
        ))}
      </nav>
    </div>
  )
}

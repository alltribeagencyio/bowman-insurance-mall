'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  /** Custom fallback UI. If omitted, a default card is shown. */
  fallback?: React.ReactNode
}

function DefaultErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
      <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
      <h3 className="font-semibold text-lg mb-1">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This section failed to load. You can try again or refresh the page.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

/**
 * React class-based Error Boundary for catching component-level errors.
 * Use this to prevent an isolated crash from taking down an entire page.
 *
 * @example
 * <ErrorBoundary>
 *   <PaymentForm />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Component stack:', info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return <DefaultErrorFallback onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

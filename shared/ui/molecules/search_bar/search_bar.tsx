"use client";

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "../../utils"
import { Input } from "../../atoms/input"
import { Button } from "../../atoms/button"

export interface SearchBarProps {
  placeholder?: string
  value?: string
  onSearch?: (value: string) => void
  onChange?: (value: string) => void
  onClear?: () => void
  loading?: boolean
  className?: string
  showClearButton?: boolean
}

const SearchBar = React.forwardRef<HTMLDivElement, SearchBarProps>(
  ({ 
    placeholder = "Search...", 
    value,
    onSearch,
    onChange,
    onClear,
    loading = false,
    className,
    showClearButton = true,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "")
    const isControlled = value !== undefined

    const currentValue = isControlled ? value : internalValue

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      
      if (!isControlled) {
        setInternalValue(newValue)
      }
      
      onChange?.(newValue)
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSearch?.(currentValue)
    }

    const handleClear = () => {
      const newValue = ""
      
      if (!isControlled) {
        setInternalValue(newValue)
      }
      
      onChange?.(newValue)
      onClear?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSearch?.(currentValue)
      }
      if (e.key === 'Escape') {
        handleClear()
      }
    }

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={placeholder}
              value={currentValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className={cn(
                "pl-10", 
                showClearButton && currentValue && "pr-10",
                className
              )}
              aria-label="Search"
            />
            {showClearButton && currentValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleClear}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {onSearch && (
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={loading || !currentValue.trim()}
              className="ml-2"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          )}
        </form>
      </div>
    )
  }
)
SearchBar.displayName = "SearchBar"

export { SearchBar }
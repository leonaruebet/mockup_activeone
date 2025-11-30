import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "../../utils"
import { Input } from '../../atoms/input'
import { Button } from '../../atoms/button'

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void
  showClearButton?: boolean
  rounded?: "sm" | "md" | "lg" | "xl" | "full"
  iconPosition?: "left" | "right"
  size?: "default" | "sm" | "lg"
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    className,
    placeholder = "Search...",
    value,
    onChange,
    onClear,
    showClearButton = true,
    rounded = "full",
    iconPosition = "left",
    size = "default",
    ...props
  }, ref) => {
    const roundedClasses = {
      sm: "rounded-sm",
      md: "rounded-md", 
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full"
    }

    const hasValue = value && String(value).length > 0

    const handleClear = () => {
      if (onClear) {
        onClear()
      } else if (onChange) {
        // Create synthetic event for onChange
        const syntheticEvent = {
          target: { value: "" }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }

    return (
      <div className="relative">
        <Search 
          className={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
            iconPosition === "left" ? "left-3" : "right-3"
          )} 
        />
        <Input
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          size={size}
          className={cn(
            iconPosition === "left" ? "pl-10" : "pr-10",
            showClearButton && hasValue && iconPosition === "left" ? "pr-10" : "",
            showClearButton && hasValue && iconPosition === "right" ? "pl-10" : "",
            roundedClasses[rounded],
            className
          )}
          {...props}
        />
        {showClearButton && hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent",
              iconPosition === "left" ? "right-2" : "left-2"
            )}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = "SearchInput"

export { SearchInput }
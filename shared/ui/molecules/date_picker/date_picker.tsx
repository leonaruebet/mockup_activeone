"use client";

import * as React from "react"
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "../../utils"
import { Button, buttonVariants, type ButtonProps } from '../../atoms/button'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Input } from '../../atoms/input' // Using design system input
import { Typography } from '../../atoms/typography' // Note: this might not exist in shadcn/ui

interface DatePickerProps {
  selectedDate?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  dateFormat?: string
  showSetDateButton?: boolean
  inputSize?: "sm" | "default" | "lg"
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateChange,
  placeholder = "Select date",
  disabled = false,
  dateFormat = "dd/MM/yyyy",
  showSetDateButton = true,
  inputSize = "default",
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [displayMonth, setDisplayMonth] = React.useState(selectedDate || new Date())
  const [tempSelectedDate, setTempSelectedDate] = React.useState<Date | undefined>(selectedDate)

  React.useEffect(() => {
    setTempSelectedDate(selectedDate)
    if (selectedDate) {
      setDisplayMonth(selectedDate)
    }
  }, [selectedDate])

  const handleDateSelect = (date: Date) => {
    setTempSelectedDate(date)
    if (!showSetDateButton) {
      onDateChange(date)
      setIsOpen(false)
    }
  }

  const handleSetDate = () => {
    onDateChange(tempSelectedDate)
    setIsOpen(false)
  }

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTempSelectedDate(undefined)
    onDateChange(undefined)
    setIsOpen(false)
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(displayMonth), { weekStartsOn: 1 }), // Monday
    end: endOfWeek(endOfMonth(displayMonth), { weekStartsOn: 1 }),
  })

  const dayHeaders = ["M", "T", "W", "TH", "F", "S", "SU"]

  return (
    <div className="relative w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={inputSize === "sm" ? "sm" : inputSize === "lg" ? "lg" : "default"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !tempSelectedDate && "text-noble-black-400",
              inputSize === "sm" && "h-8 px-3 py-1.5 text-body-s",
              inputSize === "default" && "h-9 px-3 py-2 text-body-m",
              inputSize === "lg" && "h-11 px-4 py-3 text-body-l",
              tempSelectedDate && "pr-8",
            )}
          >
            <span className="block truncate">
              {tempSelectedDate ? format(tempSelectedDate, dateFormat) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-lg shadow-lg border border-whitesmoke-300 dark:border-gray-700" align="start">
        <div className="p-4 space-y-3">
          {/* Year and Month Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDisplayMonth(subYears(displayMonth, 1))}
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Typography variant="body-l" weight="semibold" className="text-noble-black-700">
              {format(displayMonth, "yyyy")}
            </Typography>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDisplayMonth(addYears(displayMonth, 1))}
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Typography variant="body-l" weight="semibold" className="text-noble-black-700">
              {format(displayMonth, "MMMM")}
            </Typography>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {dayHeaders.map((day) => (
              <Typography key={day} variant="body-s" weight="medium" className="text-noble-black-500">
                {day}
              </Typography>
            ))}
            {daysInMonth.map((day) => (
              <Button
                key={day.toString()}
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDateSelect(day)}
                className={cn(
                  "h-8 w-8 p-0 font-normal rounded-full",
                  !isSameMonth(day, displayMonth) && "text-noble-black-300",
                  isSameDay(day, tempSelectedDate || new Date(0)) && "bg-primary-600 text-white hover:bg-primary-700",
                  isToday(day) &&
                    !isSameDay(day, tempSelectedDate || new Date(0)) &&
                    "border border-primary-500 text-primary-600",
                  isSameDay(day, tempSelectedDate || new Date(0)) &&
                    isToday(day) &&
                    "bg-primary-600 text-white ring-2 ring-primary-300 ring-offset-1",
                )}
                aria-pressed={isSameDay(day, tempSelectedDate || new Date(0))}
              >
                {format(day, "d")}
              </Button>
            ))}
          </div>
        </div>

        {showSetDateButton && (
          <div className="p-4 border-t border-whitesmoke-300 dark:border-gray-700 flex justify-end">
            <Button onClick={handleSetDate} size="sm" disabled={!tempSelectedDate}>
              Set Date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>

    {/* Clear button - positioned absolutely outside the trigger button to avoid nesting */}
    {tempSelectedDate && !disabled && (
      <button
        onClick={handleClearDate}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full hover:bg-whitesmoke-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
        aria-label="Clear date"
        type="button"
      >
        <X className="h-3 w-3 text-dimgray dark:text-whitesmoke-200" />
      </button>
    )}
  </div>
  )
}

export { DatePicker }

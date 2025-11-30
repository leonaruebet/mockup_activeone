declare module '@radix-ui/react-slot' {
  export const Slot: any
  export default Slot
}

declare module '@radix-ui/react-label' {
  export const Root: any
  const Label: any
  export default Label
}

declare module 'class-variance-authority' {
  export type VariantProps<T> = Record<string, any>
  export function cva(base?: string, config?: Record<string, any>): (options?: Record<string, any>) => string
  const defaultExport: typeof cva
  export default defaultExport
}

declare module 'clsx' {
  export type ClassValue = any
  export const clsx: (...inputs: ClassValue[]) => string
  export default clsx
}

declare module 'tailwind-merge' {
  export function twMerge(...inputs: any[]): string
}

declare module 'lucide-react' {
  export const ChevronDown: any
  export const Globe: any
}

declare module 'date-fns' {
  export function formatISO(date: Date): string
}

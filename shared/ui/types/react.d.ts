declare module 'react' {
  export type ReactNode = any
  export type ReactElement = any
  export type ComponentType<P = any> = any
  export type ElementType = any
  export type ElementRef<T> = any
  export type ForwardRefRenderFunction<T, P = any> = (props: P, ref: any) => ReactElement | null
  export type MutableRefObject<T> = { current: T }
  export type Dispatch<A> = (value: A) => void
  export type SetStateAction<S> = S | ((prev: S) => S)
  export type Context<T> = { Provider: ComponentType<{ value: T; children?: ReactNode }>; Consumer: ComponentType<{ children?: (value: T) => ReactNode }> }
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => ReactElement | null
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode }
  export type HTMLAttributes<T> = Record<string, any>
  export type InputHTMLAttributes<T> = HTMLAttributes<T>
  export type ButtonHTMLAttributes<T> = HTMLAttributes<T>
  export type TextareaHTMLAttributes<T> = HTMLAttributes<T>
  export type ComponentPropsWithoutRef<T> = Record<string, any>
  export type ReactNodeArray = ReactNode[]

  export function createContext<T>(defaultValue: T): Context<T>
  export function useContext<T>(context: Context<T>): T
  export function useState<S>(initial: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
  export function useMemo<T>(factory: () => T, deps: any[]): T
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: any[]): T
  export function useRef<T>(initial?: T): MutableRefObject<T | undefined>
  export function forwardRef<T, P = {}>(render: ForwardRefRenderFunction<T, P>): ComponentType<P & { ref?: any }>
  export const Fragment: any
  const React: {
    createElement: (...args: any[]) => any
  }
  export default React
}

declare module 'react/jsx-runtime' {
  export const jsx: any
  export const jsxs: any
  export const Fragment: any
}

declare global {
  namespace JSX {
    type Element = any
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

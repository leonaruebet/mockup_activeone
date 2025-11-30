/**
 * Shim module declarations for Next.js APIs when building the shared UI package
 * outside of a Next runtime. These declarations provide minimal typings so that
 * TypeScript can compile components that import Next helpers.
 */

declare module 'next/link' {
  import type { AnchorHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from 'react';

  interface LinkProps extends DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
    href: string;
    prefetch?: boolean;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    locale?: string | false;
  }

  const Link: (props: PropsWithChildren<LinkProps>) => JSX.Element;
  export default Link;
}

declare module 'next/navigation' {
  export interface Router {
    readonly push: (href: string, opts?: { scroll?: boolean; forceOptimisticNavigation?: boolean }) => void;
    readonly replace: (href: string, opts?: { scroll?: boolean; forceOptimisticNavigation?: boolean }) => void;
    readonly back: () => void;
    readonly forward: () => void;
    readonly refresh: () => void;
  }

  export const useRouter: () => Router;
  export const usePathname: () => string | null;
  export const useSearchParams: () => URLSearchParams;
}

declare module 'next/image' {
  import type { ImgHTMLAttributes, PropsWithChildren } from 'react';

  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    priority?: boolean;
    quality?: number | string;
    sizes?: string;
    placeholder?: 'empty' | 'blur';
    blurDataURL?: string;
    loading?: 'lazy' | 'eager';
  }

  const NextImage: (props: PropsWithChildren<ImageProps>) => JSX.Element;
  export default NextImage;
}

declare module 'next-intl' {
  export const useLocale: () => string;
  export const useTranslations: <Namespace extends string | undefined = undefined>(
    namespace?: Namespace
  ) => (key: string, values?: Record<string, unknown>) => string;
}

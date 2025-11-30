"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../molecules/card';
import { LogoSVG } from '../molecules/logo_svg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
  showMobileLogo?: boolean;
}

interface AuthBrandingPanelProps {
  title: string;
  subtitle: string;
}

function AuthBrandingPanel({ title, subtitle }: AuthBrandingPanelProps) {
  return (
    <div
      className="flex items-stretch justify-center"
      style={{
        width: 'calc(50% - 12px)', // Half width minus half of gap (24px / 2 = 12px)
        height: 'calc(100vh - 64px)' // Full viewport height minus top/bottom padding (32px + 32px)
      }}
    >
      <div className="w-full h-full flex flex-col">
        <div className="w-full h-full flex flex-col rounded-md px-4 sm:px-6 md:px-8" style={{
          background: 'linear-gradient(90deg, #ff5800, #f89e57)',
          paddingTop: '32px',
          paddingBottom: '32px'
        }}>
          <div className="flex justify-start items-start">
            <div style={{
              filter: 'brightness(0) invert(1)',
              color: 'white'
            }}>
              <LogoSVG variant="mainColor" width={60} height={20} />
            </div>
          </div>
          <div className="space-y-4 sm:space-y-8 flex-1 flex flex-col justify-center">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  {title}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-white opacity-80">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footer
}: Omit<AuthLayoutProps, 'showMobileLogo'>) {
  return (
    <main
      className="flex bg-muted/30"
      style={{
        padding: '32px 24px', // 32px top/bottom, 24px left/right
        gap: '24px',
        height: '100vh',
        minHeight: 'calc(100vh - 64px)' // Full viewport height minus top/bottom padding (32px + 32px)
      }}
    >
      <AuthBrandingPanel title={title} subtitle={subtitle} />

      {/* Right half - Auth form container */}
      <div
        className="flex items-stretch justify-center"
        style={{
          width: 'calc(50% - 12px)', // Half width minus half of gap (24px / 2 = 12px)
          height: 'calc(100vh - 64px)' // Full viewport height minus top/bottom padding (32px + 32px)
        }}
      >
        <div className="w-full h-full flex flex-col">
          <Card className="w-full h-full border-border/60 flex flex-col focus:outline-none focus:ring-0 overflow-y-auto">
            <CardHeader className="space-y-4 text-center">
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-8 flex-1 flex flex-col justify-center py-4 sm:py-6">
              {children}
            </CardContent>
            {footer && (
              <CardFooter className="flex flex-col gap-2 py-4">
                {footer}
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
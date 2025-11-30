/**
 * Toast Container Atom - Atomic Design
 * Container for displaying toast notifications
 */
'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastContainer')
  }
  return context
}

export function ToastContainer({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }
  
  const getToastClassName = (type: Toast['type']) => {
    const baseClass = 'toast toast-'
    switch (type) {
      case 'success': return baseClass + 'success'
      case 'error': return baseClass + 'error'  
      case 'warning': return baseClass + 'warning'
      case 'info': return baseClass + 'info'
      default: return baseClass + 'info'
    }
  }
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={getToastClassName(toast.type)}
            onClick={() => removeToast(toast.id)}
          >
            <span className="toast-message">{toast.message}</span>
            <button 
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation()
                removeToast(toast.id)
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export { ToastContainer as default };
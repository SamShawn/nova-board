import { clsx } from 'clsx'
import { useEffect, useRef, type ReactNode } from 'react'
import { XIcon } from '../atoms/Icons'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      contentRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={contentRef}
        className={clsx(styles.content, styles[size], className)}
        tabIndex={-1}
      >
        {title && (
          <div className={styles.header}>
            <h2 id="modal-title" className={styles.title}>{title}</h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              <XIcon size={20} />
            </button>
          </div>
        )}
        {!title && (
          <button
            type="button"
            className={styles.closeButtonAbsolute}
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon size={20} />
          </button>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}

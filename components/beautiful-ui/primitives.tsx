'use client';

// Adapted from Beautiful UI by Shane Levine (MIT). See THIRD_PARTY_NOTICES.md.
// Buttons and menu motion follow the upstream primitives; Radix supplies
// dialog focus trapping and keyboard navigation for the local demo.
import { useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Dialog as DialogPrimitive, DropdownMenu as MenuPrimitive, Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import './beautiful-ui.css';

const buttonVariants = cva('bui-button', {
  variants: {
    variant: {
      primary: 'bui-button-primary',
      secondary: 'bui-button-secondary',
      ghost: 'bui-button-ghost',
      accent: 'bui-button-accent',
      success: 'bui-button-success',
      quiet: 'bui-button-quiet',
    },
    size: {
      xs: 'bui-button-xs',
      sm: 'bui-button-sm',
      md: 'bui-button-md',
      lg: 'bui-button-lg',
      icon: 'bui-button-icon',
    },
  },
  defaultVariants: { variant: 'secondary', size: 'md' },
});

export function Button({
  variant, size, className, asChild = false, type = 'button', ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Component = asChild ? Slot.Root : 'button';
  return <Component data-slot="button" data-ui="beautiful-ui" className={cn(buttonVariants({ variant, size }), className)} {...(!asChild ? { type } : {})} {...props} />;
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input data-ui="beautiful-ui" className={cn('bui-field', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea data-ui="beautiful-ui" className={cn('bui-field bui-textarea', className)} {...props} />;
}

export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return <span data-ui="beautiful-ui" className={cn('bui-badge', className)} {...props} />;
}

export function Card({ className, asChild = false, ...props }: ComponentProps<'div'> & { asChild?: boolean }) {
  const Component = asChild ? Slot.Root : 'div';
  return <Component data-ui="beautiful-ui" className={cn('bui-card', className)} {...props} />;
}

export const Dialog = DialogPrimitive.Root;

export function DialogContent({ className, children, onOpenAutoFocus, onCloseAutoFocus, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  const previousFocus = useRef<HTMLElement | null>(null);
  return <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="beautiful-ui bui-dialog-overlay" />
    <DialogPrimitive.Content data-slot="dialog-content" data-ui="beautiful-ui" className={cn('beautiful-ui bui-dialog', className)} onOpenAutoFocus={event => {
      previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      onOpenAutoFocus?.(event);
    }} onCloseAutoFocus={event => {
      onCloseAutoFocus?.(event);
      if (!event.defaultPrevented && previousFocus.current?.isConnected) {
        event.preventDefault();
        previousFocus.current.focus();
      }
    }} {...props}>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>;
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('bui-dialog-header', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn('bui-dialog-title', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn('bui-dialog-description', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('bui-dialog-footer', className)} {...props} />;
}

export function DialogCloseButton({ label = '关闭' }: { label?: string }) {
  return <DialogPrimitive.Close asChild><Button variant="secondary" aria-label={label === '关闭' ? '关闭弹窗' : label}>{label}</Button></DialogPrimitive.Close>;
}

// Beautiful UI's single hover layer glides between rows, including keyboard focus.
function GlideMenu({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const [visible, setVisible] = useState(false);
  function moveTo(target: EventTarget | null) {
    const container = ref.current;
    if (!(target instanceof Element) || !container) return;
    const row = target.closest('[data-menu-row]');
    if (!(row instanceof HTMLElement) || !container.contains(row)) return;
    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    setBox({ top: rowRect.top - containerRect.top, height: rowRect.height });
    setVisible(true);
  }
  return <div ref={ref} className="bui-glide-menu" onMouseOver={event => moveTo(event.target)} onMouseLeave={() => setVisible(false)} onFocusCapture={event => moveTo(event.target)} onBlurCapture={event => { if (!ref.current?.contains(event.relatedTarget as Node | null)) setVisible(false); }}>
    <span className="bui-glide-highlight" aria-hidden="true" style={{ top: box?.top ?? 0, height: box?.height ?? 0, opacity: box && visible ? 1 : 0 }} />
    {children}
  </div>;
}

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;

export function DropdownMenuContent({ className, children, sideOffset = 8, ...props }: ComponentProps<typeof MenuPrimitive.Content>) {
  return <MenuPrimitive.Portal><MenuPrimitive.Content data-ui="beautiful-ui" className={cn('beautiful-ui bui-menu', className)} sideOffset={sideOffset} {...props}><GlideMenu>{children}</GlideMenu></MenuPrimitive.Content></MenuPrimitive.Portal>;
}

export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof MenuPrimitive.Item>) {
  return <MenuPrimitive.Item data-menu-row="true" className={cn('bui-menu-item', className)} {...props} />;
}

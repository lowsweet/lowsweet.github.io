'use client';

import { Children, Fragment, createContext, isValidElement, useContext, type ButtonHTMLAttributes, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useTheme } from 'antd-style';
import ConfigProvider from '@lobehub/ui/es/ConfigProvider/index';
import ThemeProvider from '@lobehub/ui/es/ThemeProvider/ThemeProvider';
import LobeButton from '@lobehub/ui/es/base-ui/Button/Button';
import LobeCheckbox from '@lobehub/ui/es/base-ui/Checkbox/Checkbox';
import LobeSwitch from '@lobehub/ui/es/base-ui/Switch/Switch';
import LobeSlider from '@lobehub/ui/es/base-ui/Slider/Slider';
import LobeProgress from '@lobehub/ui/es/base-ui/Progress/Progress';
import LobeInput from '@lobehub/ui/es/base-ui/Input/Input';
import LobeTextArea from '@lobehub/ui/es/base-ui/Input/TextArea';
import LobeDropdownMenu from '@lobehub/ui/es/base-ui/DropdownMenu/DropdownMenu';
import { ModalRoot, ModalPortal, ModalBackdrop, ModalPopup, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@lobehub/ui/es/base-ui/Modal/atoms';
import { TabsRoot, TabsList as LobeTabsList, TabsTab, TabsPanel, TabsIndicator } from '@lobehub/ui/es/base-ui/Tabs/atoms';
import type { ButtonProps as LobeButtonProps } from '@lobehub/ui/es/base-ui/Button/type';
import type { CheckboxProps } from '@lobehub/ui/es/base-ui/Checkbox/type';
import type { SwitchProps } from '@lobehub/ui/es/base-ui/Switch/type';
import type { SliderProps } from '@lobehub/ui/es/base-ui/Slider/type';
import type { DropdownItem } from '@lobehub/ui/es/base-ui/DropdownMenu/type';
import type { ThemeProviderProps } from '@lobehub/ui/es/ThemeProvider/type';
import type { InputProps, TextAreaProps } from '@lobehub/ui/es/base-ui/Input/type';

export { default as Select } from '@lobehub/ui/es/base-ui/Select/Select';
export { default as Segmented } from '@lobehub/ui/es/base-ui/Segmented/Segmented';
export { default as Popover } from '@lobehub/ui/es/base-ui/Popover/Popover';
export { default as Drawer } from '@lobehub/ui/es/base-ui/Drawer/Drawer';

const fontFamily = '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
const theme: ThemeProviderProps['theme'] = { token: { fontFamily } };

export function Input({ className = '', ...props }: InputProps) {
  return <LobeInput {...props} className={`lobe-input ${className}`} />;
}
export function Textarea({ className = '', ...props }: TextAreaProps) {
  return <LobeTextArea {...props} className={`lobe-textarea ${className}`} />;
}

export function WorkspaceTheme({ appearance, children }: { appearance: 'light' | 'dark'; children: ReactNode }) {
  return <ConfigProvider motion={motion} locale="zh-CN" config={{ globalFocusRing: false }}>
    <ThemeProvider appId="linkeai-workspace" appearance={appearance} themeMode={appearance} theme={theme}
      enableCustomFonts={false} enableGlobalStyle={false} className="lobe-workspace-theme">
      {children}
    </ThemeProvider>
  </ConfigProvider>;
}

export function useWorkspaceTokens(): CSSProperties {
  const token = useTheme();
  return {
    '--page': token.colorBgContainer,
    '--canvas': token.colorBgLayout,
    '--surface': token.colorBgElevated,
    '--field': token.colorFillQuaternary,
    '--hover': token.colorFillTertiary,
    '--selected': token.colorFillSecondary,
    '--ink': token.colorText,
    '--ink-2': token.colorTextSecondary,
    '--ink-3': token.colorTextTertiary,
    '--line': token.colorBorderSecondary,
    '--line-strong': token.colorBorder,
    '--lobe-primary': token.colorPrimary,
    '--lobe-primary-hover': token.colorPrimaryHover,
    '--lobe-success': token.colorSuccess,
    '--lobe-warning': token.colorWarning,
    '--lobe-error': token.colorError,
    '--lobe-shadow': token.boxShadowSecondary,
    fontFamily: token.fontFamily,
    colorScheme: token.isDarkMode ? 'dark' : 'light',
  } as CSSProperties;
}

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'quiet' | 'destructive' | 'link';
type ButtonSize = 'default' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-xs' | 'icon-lg';
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; asChild?: boolean };

export function Button({ variant = 'default', size = 'default', className = '', type = 'button', asChild, children, ...props }: ButtonProps) {
  const buttonType = variant === 'ghost' || variant === 'quiet' ? 'text' : variant === 'secondary' ? 'fill' : variant === 'outline' ? 'default' : variant === 'link' ? 'link' : 'primary';
  const lobeSize = size === 'sm' || size === 'icon-sm' || size === 'icon-xs' ? 'small' : size === 'lg' || size === 'icon-lg' ? 'large' : 'middle';
  const child = asChild && isValidElement<{ href?: string; children?: ReactNode }>(children) ? children : null;
  return <LobeButton {...(props as LobeButtonProps)} htmlType={type} type={buttonType} size={lobeSize} danger={variant === 'destructive'}
    href={child?.props.href} className={`lobe-button ${size.startsWith('icon') ? 'lobe-icon-button' : ''} ${className}`}
    data-variant={variant} data-slot="button">{child ? child.props.children : children}</LobeButton>;
}

// Existing workbench actions keep their handlers; the native controls are Lobe UI.
export function WorkbenchButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const variant = className.includes('wb-primary') ? 'default' : className.includes('wb-danger') ? 'destructive' : className.includes('wb-subtle') ? 'ghost' : 'outline';
  return <Button {...props} variant={variant} className={`lobe-workbench-button ${className}`} />;
}

export function Checkbox({ onCheckedChange, ...props }: CheckboxProps & { onCheckedChange?: (checked: boolean) => void }) {
  return <LobeCheckbox {...props} onChange={onCheckedChange ?? props.onChange} />;
}
export function Switch({ onCheckedChange, ...props }: SwitchProps & { 'aria-label'?: string; onCheckedChange?: (checked: boolean) => void }) {
  return <LobeSwitch {...props} onChange={onCheckedChange ?? props.onChange} />;
}
export function Slider({ value, onValueChange, ...props }: Omit<SliderProps, 'value'> & { value: number[]; onValueChange?: (value: number[]) => void }) {
  return <LobeSlider {...props} value={value[0]} onChange={next => onValueChange?.([next])} />;
}
export function Progress({ value = 0, ...props }: React.ComponentProps<typeof LobeProgress> extends infer P ? Omit<P, 'percent'> & { value?: number } : never) {
  return <LobeProgress {...props} percent={value} showInfo={false} />;
}

const DialogContext = createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null);
export function Dialog({ open = false, onOpenChange = () => {}, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: ReactNode }) {
  return <DialogContext value={{ open, onOpenChange }}><ModalRoot open={open} onOpenChange={onOpenChange}>{children}</ModalRoot></DialogContext>;
}
export function DialogHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <ModalHeader className={`lobe-dialog-header ${className}`}>{children}</ModalHeader>;
}
export const DialogTitle = ModalTitle;
export const DialogDescription = ModalDescription;
export const DialogFooter = ModalFooter;
export function DialogCloseButton() {
  const context = useContext(DialogContext);
  return <Button variant="outline" aria-label="关闭弹窗" onClick={() => context?.onOpenChange(false)}>关闭</Button>;
}
function flattenDialogChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap(child => isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
    ? flattenDialogChildren(child.props.children) : [child]);
}
export function DialogContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  const tokens = useWorkspaceTokens();
  const parts = flattenDialogChildren(children);
  const footer = parts.find(child => isValidElement(child) && child.type === DialogFooter) as ReactElement<{ children: ReactNode }> | undefined;
  const body = parts.filter(child => !isValidElement(child) || child.type !== DialogFooter);
  const lastNode = body.at(-1);
  const last = isValidElement<{ className?: string; variant?: ButtonVariant }>(lastNode) ? lastNode : undefined;
  const lastProps = last?.props;
  const primaryAction = last && ((last.type === WorkbenchButton && lastProps?.className?.includes('wb-primary'))
    || (last.type === Button && (!lastProps?.variant || lastProps.variant === 'default')));
  const actionRow = last?.type === 'div' && lastProps?.className?.includes('st-actions');
  const action = primaryAction || actionRow ? body.pop() : undefined;
  return <ModalPortal><ModalBackdrop /><ModalPopup width={className.includes('st-wide-dialog') ? 880 : 640} panelClassName="lobe-dialog-frame" style={tokens}>
    <div className={`wb lobe-dialog-content ${className}`}>
      {body.map((child, index) => <Fragment key={index}>{child}</Fragment>)}
      <ModalFooter className="lobe-dialog-footer">{footer ? footer.props.children : !actionRow && <DialogCloseButton />}{action}</ModalFooter>
    </div>
  </ModalPopup></ModalPortal>;
}

const TabsVariantContext = createContext<'point' | 'rounded'>('point');
export function Tabs({ value, defaultValue, onValueChange, children, className = '' }: { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; children: ReactNode; className?: string }) {
  return <TabsRoot value={value} defaultValue={defaultValue} onValueChange={next => { if (typeof next === 'string') onValueChange?.(next); }} className={className}>{children}</TabsRoot>;
}
export function TabsList({ variant, children, className = '' }: { variant?: string; children: ReactNode; className?: string }) {
  const lobeVariant = variant === 'line' ? 'point' : 'rounded';
  return <TabsVariantContext value={lobeVariant}><LobeTabsList variant={lobeVariant} className={`lobe-tabs-list ${className}`} data-slot="tabs-list">
    <TabsIndicator variant={lobeVariant} />{children}
  </LobeTabsList></TabsVariantContext>;
}
export function TabsTrigger({ value, children, ...props }: { value: string; children: ReactNode; className?: string; disabled?: boolean }) {
  const variant = useContext(TabsVariantContext);
  return <TabsTab {...props} value={value} variant={variant} size="middle" data-slot="tabs-trigger">{children}</TabsTab>;
}
export function TabsContent({ value, children, className = '' }: { value: string; children: ReactNode; className?: string }) {
  return <TabsPanel value={value} className={`lobe-tabs-content ${className}`}>{children}</TabsPanel>;
}

type MenuItemProps = { children?: ReactNode; onClick?: React.MouseEventHandler<HTMLElement>; onSelect?: () => void; variant?: string; asChild?: boolean };
export function DropdownMenuTrigger({ children }: { asChild?: boolean; children: ReactNode }) { return <>{children}</>; }
export function DropdownMenuContent({ children }: { align?: string; children: ReactNode }) { return <>{children}</>; }
export function DropdownMenuItem({ children }: MenuItemProps) { return <>{children}</>; }
export function DropdownMenuSeparator() { return null; }
function flattenChildren(children: ReactNode): ReactElement[] {
  return Children.toArray(children).flatMap(child => !isValidElement<{ children?: ReactNode }>(child) ? [] : child.type === Fragment ? flattenChildren(child.props.children) : [child]);
}
export function DropdownMenu({ children }: { children: ReactNode }) {
  const parts = flattenChildren(children);
  const trigger = parts.find(item => item.type === DropdownMenuTrigger) as ReactElement<{ children: ReactNode }> | undefined;
  const content = parts.find(item => item.type === DropdownMenuContent) as ReactElement<{ children: ReactNode }> | undefined;
  const items: DropdownItem[] = flattenChildren(content?.props.children).map((child, index) => {
    if (child.type === DropdownMenuSeparator) return { type: 'divider', key: index };
    const item = child.props as MenuItemProps;
    const link = item.asChild && isValidElement<{ href?: string; children?: ReactNode }>(item.children) ? item.children : null;
    return { key: index, label: link?.props.children ?? item.children, danger: item.variant === 'destructive', onClick: (event: React.MouseEvent<HTMLElement>) => {
      item.onClick?.(event); item.onSelect?.(); if (link?.props.href) window.location.assign(link.props.href);
    } };
  });
  return <LobeDropdownMenu items={items} placement="bottomRight" nativeButton>{trigger?.props.children}</LobeDropdownMenu>;
}

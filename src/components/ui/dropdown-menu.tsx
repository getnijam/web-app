import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

import {
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuTrigger as DropdownMenuTriggerPrimitive,
  DropdownMenuPortal as DropdownMenuPortalPrimitive,
  DropdownMenuContent as DropdownMenuContentPrimitive,
  DropdownMenuGroup as DropdownMenuGroupPrimitive,
  DropdownMenuHighlight as DropdownMenuHighlightPrimitive,
  DropdownMenuHighlightItem as DropdownMenuHighlightItemPrimitive,
  DropdownMenuItem as DropdownMenuItemPrimitive,
  DropdownMenuItemIndicator as DropdownMenuItemIndicatorPrimitive,
  DropdownMenuCheckboxItem as DropdownMenuCheckboxItemPrimitive,
  DropdownMenuRadioGroup as DropdownMenuRadioGroupPrimitive,
  DropdownMenuRadioItem as DropdownMenuRadioItemPrimitive,
  DropdownMenuLabel as DropdownMenuLabelPrimitive,
  DropdownMenuSeparator as DropdownMenuSeparatorPrimitive,
  DropdownMenuShortcut as DropdownMenuShortcutPrimitive,
  DropdownMenuSub as DropdownMenuSubPrimitive,
  DropdownMenuSubContent as DropdownMenuSubContentPrimitive,
  DropdownMenuSubTrigger as DropdownMenuSubTriggerPrimitive,
  type DropdownMenuProps,
  type DropdownMenuTriggerProps,
  type DropdownMenuContentProps,
  type DropdownMenuGroupProps,
  type DropdownMenuItemProps as DropdownMenuItemPrimitiveProps,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuRadioGroupProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuLabelProps as DropdownMenuLabelPrimitiveProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuShortcutProps,
  type DropdownMenuSubProps,
  type DropdownMenuSubContentProps,
  type DropdownMenuSubTriggerProps as DropdownMenuSubTriggerPrimitiveProps,
} from '@/components/ui/dropdown-menu-primitive';
import { cn } from '@/lib/utils';

function DropdownMenu(props: DropdownMenuProps) {
  return <DropdownMenuPrimitive {...props} />;
}

function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <DropdownMenuTriggerPrimitive {...props} />;
}

function DropdownMenuPortal(props: React.ComponentProps<typeof DropdownMenuPortalPrimitive>) {
  return <DropdownMenuPortalPrimitive {...props} />;
}

function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <DropdownMenuGroupPrimitive {...props} />;
}

function DropdownMenuContent({
  sideOffset = 4,
  align = 'start',
  className,
  children,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContentPrimitive
      sideOffset={sideOffset}
      align={align}
      className={cn(
        'relative z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-xl',
        className,
      )}
      {...props}
    >
      <DropdownMenuHighlightPrimitive className="absolute inset-0 z-0 rounded-xl bg-accent">
        {children}
      </DropdownMenuHighlightPrimitive>
    </DropdownMenuContentPrimitive>
  );
}

type DropdownMenuItemProps = DropdownMenuItemPrimitiveProps & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
};

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  disabled,
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuHighlightItemPrimitive
      activeClassName={variant === 'destructive' ? 'bg-destructive/10 dark:bg-destructive/20' : ''}
      disabled={disabled}
    >
      <DropdownMenuItemPrimitive
        disabled={disabled}
        data-inset={inset}
        data-variant={variant}
        className={cn(
          "group/dropdown-menu-item relative flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-hidden select-none focus:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-inset:pl-9.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive! [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
          className,
        )}
        {...props}
      />
    </DropdownMenuHighlightItemPrimitive>
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  disabled,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuHighlightItemPrimitive disabled={disabled}>
      <DropdownMenuCheckboxItemPrimitive
        disabled={disabled}
        className={cn(
          "relative flex cursor-pointer items-center gap-2.5 rounded-xl py-2 pr-3 pl-9.5 text-sm outline-hidden select-none focus:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        checked={checked}
        {...props}
      >
        <span className="pointer-events-none absolute left-3 flex size-4 items-center justify-center">
          <DropdownMenuItemIndicatorPrimitive
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
          </DropdownMenuItemIndicatorPrimitive>
        </span>
        {children}
      </DropdownMenuCheckboxItemPrimitive>
    </DropdownMenuHighlightItemPrimitive>
  );
}

function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <DropdownMenuRadioGroupPrimitive {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  disabled,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <DropdownMenuHighlightItemPrimitive disabled={disabled}>
      <DropdownMenuRadioItemPrimitive
        disabled={disabled}
        className={cn(
          "relative flex cursor-pointer items-center gap-2.5 rounded-xl py-2 pr-3 pl-9.5 text-sm outline-hidden select-none focus:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        <span className="pointer-events-none absolute left-3 flex size-4 items-center justify-center">
          <DropdownMenuItemIndicatorPrimitive layoutId="dropdown-menu-radio-indicator">
            <span className="size-2 rounded-full bg-current" />
          </DropdownMenuItemIndicatorPrimitive>
        </span>
        {children}
      </DropdownMenuRadioItemPrimitive>
    </DropdownMenuHighlightItemPrimitive>
  );
}

type DropdownMenuLabelProps = DropdownMenuLabelPrimitiveProps & {
  inset?: boolean;
};

function DropdownMenuLabel({ className, inset, ...props }: DropdownMenuLabelProps) {
  return (
    <DropdownMenuLabelPrimitive
      data-inset={inset}
      className={cn('px-3 py-2.5 text-xs text-muted-foreground data-inset:pl-9.5', className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuSeparatorPrimitive
      className={cn('-mx-1 my-1 h-px bg-border/50', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
  return (
    <DropdownMenuShortcutPrimitive
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  );
}

function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <DropdownMenuSubPrimitive {...props} />;
}

type DropdownMenuSubTriggerProps = DropdownMenuSubTriggerPrimitiveProps & {
  inset?: boolean;
};

function DropdownMenuSubTrigger({
  disabled,
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <DropdownMenuHighlightItemPrimitive disabled={disabled}>
      <DropdownMenuSubTriggerPrimitive
        disabled={disabled}
        data-inset={inset}
        className={cn(
          "relative flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-hidden select-none focus:text-accent-foreground data-inset:pl-9.5 data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        {children}
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-auto" />
      </DropdownMenuSubTriggerPrimitive>
    </DropdownMenuHighlightItemPrimitive>
  );
}

function DropdownMenuSubContent({ className, ...props }: DropdownMenuSubContentProps) {
  return (
    <DropdownMenuSubContentPrimitive
      className={cn(
        'relative z-50 min-w-36 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-xl',
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { Siren, BookOpen } from 'lucide-react';
import { useChatMode } from '../hooks/use-chat-mode';
import type { ModeType } from '@/lib/mode';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const modes: Array<{
  id: ModeType;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    id: 'ilkyardim',
    label: 'İlkyardım Modu',
    description: 'Only you can access this chat',
    icon: <Siren size={16} />,
  },
  {
    id: 'egitim',
    label: 'Eğitim Modu',
    description: 'Anyone with the link can access this chat',
    icon: <BookOpen size={16} />,
  },
];

export function ModeSelector({
  chatId,
  className,
  selectedModeType,
  compact,
}: {
  chatId: string;
  selectedModeType: ModeType;
  compact?: boolean;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);

  const { modeType, setModeType } = useChatMode({
    chatId,
    initialMode: selectedModeType,
  });

  const selectedMode = useMemo(
    () => modes.find((mode) => mode.id === modeType),
    [modeType],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger
            asChild
            className={cn(
              'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
              className,
            )}
          >
            {compact ? (
              <Button
                variant="ghost"
                className="rounded-md p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
              >
                {selectedMode?.icon}
              </Button>
            ) : (
              <Button variant="outline" className="hidden md:flex md:px-2 md:h-[34px]">
                {selectedMode?.icon}
                {selectedMode?.label}
                <ChevronDownIcon />
              </Button>
            )}
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">{selectedMode?.label ?? 'Mode'}</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align={compact ? 'end' : 'start'} className="min-w-[300px]">
        {modes.map((mode) => (
          <DropdownMenuItem
            key={mode.id}
            onSelect={() => {
              setModeType(mode.id);
              setOpen(false);
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={mode.id === modeType}
          >
            <div className="flex flex-col gap-1 items-start">
              {mode.label}
              {mode.description && (
                <div className="text-xs text-muted-foreground">{mode.description}</div>
              )}
            </div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircleFillIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}



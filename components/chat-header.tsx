'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import type { ModeType } from '@/lib/mode';
import { PhoneIcon } from 'lucide-react';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedModeType,
  isReadonly,
}: {
  chatId: string;
  selectedModelId: string;
  selectedModeType: ModeType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 justify-between">
      <div className="flex items-center gap-2">
        <SidebarToggle />
        {!isReadonly && (
          <ModelSelector
            selectedModelId={selectedModelId}
            className="order-1 md:order-2"
          />
        )}
        {/* Mode selector moved to input area */}
      </div>
      

      <Button
        className="bg-red-700 hover:bg-red-800 text-white flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
        asChild
      >
        <Link
          href="tel:112"
          target="_noblank"
        >
          <PhoneIcon size={16} />
          112
        </Link>
      </Button>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});

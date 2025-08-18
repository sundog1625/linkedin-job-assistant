'use client'

import { useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/lib/i18n/context'
import { LanguageCode } from '@/lib/i18n/languages'

interface LanguageSelectorProps {
  collapsed?: boolean
}

export function LanguageSelector({ collapsed = false }: LanguageSelectorProps) {
  const { language, setLanguage, t, availableLanguages } = useI18n()
  const [open, setOpen] = useState(false)

  const currentLanguage = availableLanguages[language]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-2 ${collapsed ? 'w-8 h-8 p-0' : 'w-full justify-start'}`}>
          <Globe className="h-4 w-4" />
          {!collapsed && (
            <>
              <span>{currentLanguage.flag}</span>
              <span className="flex-1 text-left">{currentLanguage.name}</span>
            </>
          )}
          {!collapsed && <ChevronDown className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(availableLanguages).map(([code, lang]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => {
              setLanguage(code as LanguageCode)
              setOpen(false)
            }}
            className={`flex items-center gap-3 ${
              language === code ? 'bg-accent' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {language === code && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
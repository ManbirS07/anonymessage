'use client'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/src/app/components/ui/input-group'

export function Password(props: React.ComponentProps<typeof InputGroupInput>) {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const toggleVisibility = () => setIsVisible((prev) => !prev)

  return (
    <InputGroup className="h-10 bg-slate-900/60 border border-slate-700 rounded-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
      <InputGroupInput
        placeholder="••••••••"
        type={isVisible ? 'text' : 'password'}
        className="text-white placeholder-slate-500 bg-transparent text-sm flex-1"
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          onClick={toggleVisibility}
          size="icon-xs"
          className="text-slate-400 hover:text-slate-200 hover:bg-transparent transition-colors"
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
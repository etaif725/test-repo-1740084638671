/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { PromptForm } from "./components/prompt-form"
import { type FormValues, type ApiKeyValues } from "./components/prompt-form"
import { generateSalesPrompt } from "@/lib/openai"
import { GeneratedPrompt } from "./components/generated-prompt"
import DashboardLayout from "@/components/layout"
import Bgdark from '@/public/img/dark/ai-chat/bg-image.png';
import Bg from '@/public/img/light/ai-chat/bg-image.png';
import { User } from "@supabase/supabase-js"
import { useTheme } from "next-themes"

const STORAGE_KEY = "sales-prompt-result"

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export function PromptContainer(props: Props) {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [currentFormData, setCurrentFormData] = useState<(FormValues & ApiKeyValues) | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [formHeight, setFormHeight] = useState<number>(0)

  // Load saved result from localStorage
  useEffect(() => {
    // Only clear prompt-related data
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("sales-prompt-form-deleted");
    localStorage.removeItem("sales-prompt-form-can-undo");
    
    // Then load fresh result if exists
    const savedResult = localStorage.getItem(STORAGE_KEY)
    if (savedResult) {
      setResult(savedResult)
    }
  }, [])

  useEffect(() => {
    const updateHeight = () => {
      if (formRef.current) {
        setFormHeight(formRef.current.offsetHeight)
      }
    }
    
    // Initial update
    updateHeight()
    
    // Update after a short delay to ensure form is fully rendered
    const initialTimer = setTimeout(updateHeight, 100)
    
    // Update on window resize
    window.addEventListener('resize', updateHeight)
    
    // Create a mutation observer to watch for DOM changes
    const observer = new MutationObserver(updateHeight)
    if (formRef.current) {
      observer.observe(formRef.current, { 
        subtree: true, 
        childList: true,
        attributes: true 
      })
    }
    
    return () => {
      window.removeEventListener('resize', updateHeight)
      observer.disconnect()
      clearTimeout(initialTimer)
    }
  }, [])

  useEffect(() => {
    if (result) {
      localStorage.setItem(STORAGE_KEY, result)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [result])

  const handleSubmit = async (values: FormValues & ApiKeyValues) => {
    if (!values.openaiApiKey) {
      return false
    }
    setIsLoading(true)
    setCurrentFormData(values)
    try {
      const prompt = await generateSalesPrompt(values)
      setResult(prompt)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreFormData = (formData: FormValues & ApiKeyValues | null) => {
    if (formData) {
      setCurrentFormData(formData)
    }
  }

  const handleRestorePrompt = (prompt: string) => {
    setResult(prompt)
  }

  const handleClearPrompt = () => {
    setResult(null);
  }

  return (
<DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Playground"
      description="Play around with our AI Prompt Creator"
    >
      <div className="relative flex w-full flex-col pt-[20px] md:pt-0">
        <img
          width="340"
          height="181"
          src={theme === 'dark' ? Bgdark.src : Bg.src}
          className="absolute left-[20%] top-[50%] z-[-2] w-[200px] translate-y-[-50%] md:left-[35%] lg:left-[38%] xl:left-[38%] xl:w-[350px] z-[0]"
          alt=""
        />
          {/* Main Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div ref={formRef}>
              <PromptForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
                restoredFormData={currentFormData}
                onFormDataLoad={setCurrentFormData}
              />
            </div>
            <div className="mt-0 lg:mt-0 lg:pl-0 flex flex-col" style={{ height: formHeight ? `${formHeight}px` : 'auto' }}>
              <GeneratedPrompt 
                prompt={result} 
                isLoading={isLoading}
                currentFormData={currentFormData}
                onRestoreFormData={handleRestoreFormData}
                onRestorePrompt={handleRestorePrompt}
                onClearPrompt={handleClearPrompt}
                containerHeight={formHeight}
              />
            </div>
          </div>
        </div>
    </DashboardLayout>
  )
}

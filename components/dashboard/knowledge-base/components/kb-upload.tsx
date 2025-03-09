/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/components/layout"
import { User } from "@supabase/supabase-js"
import { useTheme } from "next-themes"
import { createClient } from '@supabase/supabase-js'
import Retell from 'retell-sdk'
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const STORAGE_KEY = "kb-upload-result"
const RETELL_API_KEY = process.env.NEXT_PUBLIC_RETELL_API_KEY || ''

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Initialize Retell client
const retellClient = new Retell({
  apiKey: RETELL_API_KEY,
})

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

interface KnowledgeBase {
  id: string;
  name: string;
  created_at: string;
}

interface Source {
  id: string;
  type: 'file' | 'url';
  name: string;
  created_at: string;
}

const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'text/csv',
  'application/pdf',
  'text/plain'
]

export function KbUpload(props: Props) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [urls, setUrls] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const formRef = useRef<HTMLDivElement>(null)
  const [formHeight, setFormHeight] = useState<number>(0)

  useEffect(() => {
    loadKnowledgeBases()
  }, [])

  useEffect(() => {
    const updateHeight = () => {
      if (formRef.current) {
        setFormHeight(formRef.current.offsetHeight)
      }
    }
    
    updateHeight()
    const initialTimer = setTimeout(updateHeight, 100)
    
    window.addEventListener('resize', updateHeight)
    
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

  const loadKnowledgeBases = async () => {
    try {
      const response = await retellClient.knowledgeBase.list()
      setKnowledgeBases(response.map((kb) => ({
        id: kb.knowledge_base_id,
        name: kb.knowledge_base_name,
        created_at: kb.last_refreshed_timestamp.toString()
      })))
    } catch (err) {
      console.error('Error loading knowledge bases:', err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload docx, csv, pdf, or txt files.')
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleAddUrl = () => {
    if (!newUrl) return
    
    try {
      new URL(newUrl) // Validate URL
      setUrls([...urls, newUrl])
      setNewUrl('')
      setError(null)
    } catch {
      setError('Please enter a valid URL')
    }
  }

  const handleRemoveUrl = (urlToRemove: string) => {
    setUrls(urls.filter(url => url !== urlToRemove))
  }

  const handleUpload = async () => {
    if (!file && urls.length === 0) {
      setError('Please select a file or add URLs to upload')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const uploadParams: any = {}

      if (file) {
        uploadParams.knowledge_base_files = [file]
      }

      if (urls.length > 0) {
        uploadParams.knowledge_base_urls = urls
      }

      const response = await retellClient.knowledgeBase.addSources(uploadParams, {})

      setUploadProgress(100)
      console.log('Knowledge base updated:', response)
      
      // Reset form
      setFile(null)
      setUrls([])
      loadKnowledgeBases()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload')
      console.error('Upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Knowledge Base"
      description="Upload and manage your knowledge base documents"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="mb-5">
            <p className="text-xl font-extrabold text-zinc-950 dark:text-white md:text-3xl">
              Upload Documents
            </p>
            <p className="mb-5 mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-base">
              Add files or URLs to your knowledge base
            </p>
            <hr className="my-8" />
          </div>
            
          <div className="space-y-6">
            <div className="space-y-2 text-black dark:text-white">
              <Label htmlFor="file-upload">File Upload (docx, csv, pdf, txt - max 1.4MB per file)</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".docx,.csv,.pdf,.txt"
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2 text-black dark:text-white">
              <Label htmlFor="url-input">URL Upload (max 10 URLs)</Label>
              <div className="flex gap-2">
                <Input
                  id="url-input"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Enter URL"
                />
                <Button 
                  onClick={handleAddUrl}
                  className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white"
                >
                  Add
                </Button>
              </div>
              
              {urls.length > 0 && (
                <div className="mt-4 space-y-2">
                  {urls.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="truncate text-sm">{url}</span>
                      <Button
                        onClick={() => handleRemoveUrl(url)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={isLoading}
              className="w-full font-semibold bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Uploading...' : 'Upload to Knowledge Base'}
            </Button>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6" style={{ height: formHeight ? `${formHeight}px` : 'auto' }}>
          <div className="mb-5">
            <p className="text-xl font-extrabold text-zinc-950 dark:text-white md:text-3xl">
              Knowledge Bases
            </p>
            <p className="mb-5 mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-base">
              Your existing knowledge bases
            </p>
            <hr className="my-8" />
          </div>
          
          {knowledgeBases.length > 0 ? (
            <div className="space-y-2">
              {knowledgeBases.map((kb) => (
                <div key={kb.id} className="p-4 border dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700">
                  <div className="font-medium text-zinc-900 dark:text-white">{kb.name}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Created: {new Date(kb.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400">No knowledge bases found</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default KbUpload
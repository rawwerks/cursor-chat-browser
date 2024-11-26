"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ComposerChat } from '@/types/workspace'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loading } from "@/components/ui/loading"

interface ComposerWithWorkspace extends ComposerChat {
  workspaceId: string;
  workspaceFolder?: string;
}

// Helper function to safely format dates
const safeFormat = (date: string | number | Date | undefined | null) => {
  try {
    if (!date) return 'Unknown date'
    const dateObj = new Date(date)
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return 'Invalid date'
    return format(dateObj, 'PPP p')
  } catch (error) {
    console.error('Error formatting date:', error, 'Raw value:', date)
    return 'Invalid date'
  }
}

export function ComposerList() {
  const [composers, setComposers] = useState<ComposerWithWorkspace[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchComposers = async () => {
      try {
        const response = await fetch('/api/composers')
        const data = await response.json()
        
        // Sort by last message timestamp, newest first
        data.sort((a: ComposerWithWorkspace, b: ComposerWithWorkspace) => {
          const aTime = a.lastUpdatedAt || a.createdAt || 0
          const bTime = b.lastUpdatedAt || b.createdAt || 0
          return bTime - aTime
        })

        setComposers(data)
      } catch (error) {
        console.error('Failed to fetch composers:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchComposers()
  }, [])

  if (isLoading) {
    return <Loading message="Loading composer logs..." />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workspace Hash</TableHead>
            <TableHead>Folder</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="text-right">Messages</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {composers.map((composer) => (
            <TableRow key={composer.composerId} className="hover:bg-accent/50">
              <TableCell>
                <Link 
                  href={`/workspace/${composer.workspaceId}?tab=${composer.composerId}&type=composer`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {composer.workspaceId}
                </Link>
              </TableCell>
              <TableCell>
                {composer.workspaceFolder ? (
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-500 mt-1">📁</span>
                    <span 
                      className="break-all text-sm"
                      title={composer.workspaceFolder}
                    >
                      {composer.workspaceFolder}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">No folder</span>
                )}
              </TableCell>
              <TableCell>
                {safeFormat(composer.lastUpdatedAt || composer.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                {composer.conversation?.length || 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 
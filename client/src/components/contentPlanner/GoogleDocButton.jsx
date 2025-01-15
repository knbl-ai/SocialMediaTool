import React from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { FileTextIcon } from 'lucide-react'

export default function GoogleDocButton({ isOpen, onOpenChange }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 flex gap-1">
          <FileTextIcon className="h-4 w-4 text-blue-500" />
          Doc
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Google Doc Link</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="doc-link"
            type="url"
            placeholder="Paste Google Doc link here..."
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface TagInputProps {
  value?: string[]
  onChange?: (tags: string[]) => void
  disabled?: boolean
}

export default function TagInput({ value, onChange, disabled = false }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(value || [])
  const [inputValue, setInputValue] = useState("")

  // Update internal state when prop changes
  useEffect(() => {
    if (value) {
      setTags(value)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault()
      if (tags.length < 5 && !tags.includes(inputValue.trim())) {
        const newTags = [...tags, inputValue.trim()]
        setTags(newTags)
        onChange?.(newTags)
        setInputValue("")
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(newTags)
    onChange?.(newTags)
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full hover:bg-muted p-0.5"
              disabled={disabled}
            >
              <X size={14} />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={tags.length >= 5 ? "Maximum tags reached" : "Type a tag and press Enter"}
        disabled={tags.length >= 5 || disabled}
      />
    </div>
  )
}


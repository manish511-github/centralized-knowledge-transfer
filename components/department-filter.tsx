"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface Department {
  id: string
  label: string
}

export default function DepartmentFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get selected departments from URL on initial load
  useEffect(() => {
    const departmentParam = searchParams.get("department")
    if (departmentParam) {
      setSelectedDepartments(departmentParam.split(","))
    }
  }, [searchParams])

  // Fetch departments from API
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch("/api/departments")
        const data = await response.json()
        setDepartments(data.departments || [])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching departments:", error)
        // Fallback to default departments if API fails
        setDepartments([
          { id: "development", label: "Development" },
          { id: "qa", label: "Quality Assurance" },
          { id: "hr", label: "Human Resources" },
          { id: "product", label: "Product Management" },
          { id: "design", label: "Design" },
          { id: "marketing", label: "Marketing" },
          { id: "sales", label: "Sales" },
          { id: "finance", label: "Finance" },
          { id: "security", label: "Security" },
          { id: "operations", label: "Operations" },
        ])
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  // Handle department selection
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartments((prev) => {
      const newSelection = prev.includes(departmentId)
        ? prev.filter((d) => d !== departmentId)
        : [...prev, departmentId]

      // Update URL with selected departments
      const params = new URLSearchParams(searchParams.toString())
      if (newSelection.length > 0) {
        params.set("department", newSelection.join(","))
      } else {
        params.delete("department")
      }
      router.push(`/?${params.toString()}`)

      return newSelection
    })
  }

  // Clear all selected departments
  const clearFilters = () => {
    setSelectedDepartments([])
    const params = new URLSearchParams(searchParams.toString())
    params.delete("department")
    router.push(`/?${params.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {departments.map((department) => (
          <div key={department.id} className="flex items-center space-x-2">
            <Checkbox
              id={`department-${department.id}`}
              checked={selectedDepartments.includes(department.id)}
              onCheckedChange={() => handleDepartmentChange(department.id)}
            />
            <Label
              htmlFor={`department-${department.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {department.label}
            </Label>
          </div>
        ))}
      </div>

      {selectedDepartments.length > 0 && (
        <>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{selectedDepartments.length} selected</span>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
              Clear filters
            </Button>
          </div>
        </>
      )}
    </div>
  )
}


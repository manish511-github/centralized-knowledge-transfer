"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"

export default function DepartmentFilter() {
  const [departments, setDepartments] = useState<{ id: string; label: string }[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get initial selected departments from URL
    const deptParam = searchParams.get("department")
    if (deptParam) {
      setSelectedDepartments(deptParam.split(","))
    }

    // Fetch departments from database
    const fetchDepartments = async () => {
      try {
        // This would typically be an API call, but for simplicity we'll use a direct fetch
        const response = await fetch("/api/departments")
        if (response.ok) {
          const data = await response.json()
          setDepartments(data.departments)
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error)
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
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [searchParams])

  const toggleDepartment = (department: string) => {
    setSelectedDepartments((prev) => {
      const newSelection = prev.includes(department) ? prev.filter((d) => d !== department) : [...prev, department]

      // Update URL with selected departments
      const params = new URLSearchParams(searchParams.toString())
      if (newSelection.length > 0) {
        params.set("department", newSelection.join(","))
      } else {
        params.delete("department")
      }

      // Update the URL and refresh the page to apply the filter
      router.push(`${window.location.pathname}?${params.toString()}`)

      return newSelection
    })
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-5 bg-muted rounded w-full"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {departments.map((department) => (
        <div key={department.id} className="flex items-center space-x-2">
          <Checkbox
            id={department.id}
            checked={selectedDepartments.includes(department.id)}
            onCheckedChange={() => toggleDepartment(department.id)}
          />
          <Label htmlFor={department.id} className="text-sm cursor-pointer">
            {department.label}
          </Label>
        </div>
      ))}
    </div>
  )
}


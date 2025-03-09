"use server"

import { redirect } from "next/navigation"

export async function searchQuestions(formData: FormData) {
  const searchQuery = formData.get("q")?.toString()

  if (searchQuery?.trim()) {
    redirect(`/search?q=${encodeURIComponent(searchQuery)}&type=questions`)
  }

  // If no search query, stay on the same page
  return null
}


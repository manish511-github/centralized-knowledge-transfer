import { requireAuth } from "@/lib/auth"
import { PostQuestionForm } from "@/components/post-question-form"

export default async function AskQuestion() {
  // Check if user is authenticated
  await requireAuth()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ask a Question</h1>
      <PostQuestionForm />
    </main>
  )
}


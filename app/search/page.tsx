import { SearchResults } from "@/components/search-results"

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q: string; type: string }
}) {
  const query = searchParams.q || ""
  const type = searchParams.type || "all"

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>
      <SearchResults initialQuery={query} initialType={type} />
    </main>
  )
}


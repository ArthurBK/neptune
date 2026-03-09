'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { urlFor } from '@/sanity/lib/image'

type SearchArticle = {
  _id: string
  title: string
  slug: string
  category: string
  coverImage?: { asset?: { _ref: string }; alt?: string }
  author?: { name: string } | null
  href: string
}

type SearchContributor = {
  _id: string
  name: string
  slug: string
  role?: string | null
  portrait?: { asset?: { _ref: string }; alt?: string } | null
  href: string
}

type SearchProduct = {
  title: string
  handle: string
  featuredImage?: { url: string; altText: string | null }
  href: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState<SearchArticle[]>([])
  const [contributors, setContributors] = useState<SearchContributor[]>([])
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  const fetchResults = useCallback(async (q: string, signal?: AbortSignal) => {
    if (q.length < 2) {
      setArticles([])
      setContributors([])
      setProducts([])
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal })
      const data = await res.json()
      setArticles(data.articles ?? [])
      setContributors(data.contributors ?? [])
      setProducts(data.products ?? [])
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setArticles([])
      setContributors([])
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    inputRef.current?.focus()
    setQuery('')
    setArticles([])
    setContributors([])
    setProducts([])
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setArticles([])
      setContributors([])
      setProducts([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      fetchResults(query, abortRef.current.signal)
    }, 250)
    return () => {
      clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    }
  }, [query, fetchResults])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      tabIndex={-1}
    >
      <div
        className="mx-auto mt-[var(--header-height)] max-w-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#E5E5E5] px-6 py-4">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, contributors, or products..."
            className="w-full bg-transparent text-lg text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:outline-none"
            autoComplete="off"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="px-6 py-12 text-center text-[#6B6B6B]">
              Searching...
            </div>
          )}

          {!isLoading &&
            query.length >= 2 &&
            articles.length === 0 &&
            contributors.length === 0 &&
            products.length === 0 && (
              <div className="px-6 py-12 text-center text-[#6B6B6B]">
                No results found for &quot;{query}&quot;
              </div>
            )}

          {!isLoading &&
            (articles.length > 0 || contributors.length > 0 || products.length > 0) && (
              <div className="divide-y divide-[#E5E5E5]">
                {articles.length > 0 && (
                <div className="px-6 py-4">
                  <p className="mb-3 text-xs font-medium tracking-[0.2em] uppercase text-[#6B6B6B]">
                    Articles
                  </p>
                  <ul className="space-y-2">
                    {articles.map((a) => (
                      <li key={a._id}>
                        <Link
                          href={a.href}
                          onClick={onClose}
                          className="flex items-center gap-4 py-2 transition-colors hover:text-black"
                        >
                          {a.coverImage?.asset && (
                            <div className="relative h-12 w-16 shrink-0 overflow-hidden bg-[#E5E5E5]">
                              <Image
                                src={urlFor(a.coverImage).width(128).height(96).url()}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-serif text-[#1A1A1A]">
                              {a.title}
                            </p>
                            <p className="text-xs text-[#6B6B6B]">
                              {a.category} {a.author && `· ${a.author.name}`}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

                {contributors.length > 0 && (
                  <div className="px-6 py-4">
                    <p className="mb-3 text-xs font-medium tracking-[0.2em] uppercase text-[#6B6B6B]">
                      Contributors
                    </p>
                    <ul className="space-y-2">
                      {contributors.map((c) => (
                        <li key={c._id}>
                          <Link
                            href={c.href}
                            onClick={onClose}
                            className="flex items-center gap-4 py-2 transition-colors hover:text-black"
                          >
                            {c.portrait?.asset && (
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#E5E5E5]">
                                <Image
                                  src={urlFor(c.portrait).width(96).height(96).url()}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-serif text-[#1A1A1A]">{c.name}</p>
                              {c.role && (
                                <p className="text-xs text-[#6B6B6B]">{c.role}</p>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {products.length > 0 && (
                <div className="px-6 py-4">
                  <p className="mb-3 text-xs font-medium tracking-[0.2em] uppercase text-[#6B6B6B]">
                    Products
                  </p>
                  <ul className="space-y-2">
                    {products.map((p) => (
                      <li key={p.handle}>
                        <Link
                          href={p.href}
                          onClick={onClose}
                          className="flex items-center gap-4 py-2 transition-colors hover:text-black"
                        >
                          {p.featuredImage?.url && (
                            <div className="relative h-12 w-16 shrink-0 overflow-hidden bg-[#E5E5E5]">
                              <Image
                                src={p.featuredImage.url}
                                alt={p.featuredImage.altText ?? p.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-serif text-[#1A1A1A]">
                              {p.title}
                            </p>
                            <p className="text-xs text-[#6B6B6B]">Newsstand</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

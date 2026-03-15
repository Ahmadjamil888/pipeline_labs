'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/app/supabase-client'
import { Provider } from '@supabase/supabase-js'

export interface GitHubUser {
  id: string
  login: string
  avatar_url: string
  name: string
  email: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  clone_url: string
  default_branch: string
  language: string | null
  stargazers_count: number
  fork: boolean
}

// Hook for GitHub authentication via Supabase
export function useGitHubAuth() {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Get GitHub provider data from user metadata
        const githubUser = session.user.user_metadata as GitHubUser
        setUser(githubUser)
      }
    }
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user.user_metadata as GitHubUser)
      }
      if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Sign in with GitHub
  const signInWithGitHub = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'repo read:user read:org', // Request repo access
        }
      })

      if (error) throw error
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signInWithGitHub,
    signOut
  }
}

// Hook for fetching user's GitHub repositories
export function useGitHubRepos() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchRepos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Get session to retrieve GitHub access token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.provider_token) {
        throw new Error('GitHub not connected. Please sign in with GitHub.')
      }

      // Fetch repositories from GitHub API
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`)
      }

      const data = await response.json()
      setRepos(data)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    repos,
    loading,
    error,
    fetchRepos
  }
}

// Hook to connect a GitHub repository to Pipeline
export function useConnectRepository() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const connectRepository = useCallback(async (repo: GitHubRepo) => {
    setLoading(true)
    setError(null)
    try {
      // Get the provider token for GitHub
      const { data: { session } } = await supabase.auth.getSession()
      const githubToken = session?.provider_token

      // Call backend API to connect repository
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/repos/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${githubToken}`
        },
        body: JSON.stringify({
          repo_url: repo.clone_url,
          provider: 'github',
          branch: repo.default_branch,
          name: repo.name,
          github_token: githubToken
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to connect repository')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    connectRepository,
    loading,
    error
  }
}

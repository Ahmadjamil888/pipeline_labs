'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useClerkSupabaseClient } from '@/lib/clerk-supabase-client'
import { useSupabaseQuery } from '@/lib/supabase-hooks'

interface Task {
  id: number
  name: string
  user_id: string
  created_at: string
}

export default function TasksExample() {
  const { user, isLoaded: userLoaded } = useUser()
  const client = useClerkSupabaseClient()
  const [newTaskName, setNewTaskName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch tasks for the current user
  const { data: tasks, loading, error, refresh } = useSupabaseQuery<Task>('tasks', {
    orderBy: { column: 'created_at', ascending: false },
  })

  // Create a new task with user_id from Clerk
  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newTaskName.trim()) return

    setIsSubmitting(true)
    try {
      // Insert with user_id from Clerk explicitly
      const { error } = await client.from('tasks').insert({
        name: newTaskName.trim(),
        user_id: user.id, // from useUser() hook - Clerk user ID
      })

      if (error) throw error

      setNewTaskName('')
      refresh() // Refresh the tasks list
    } catch (err) {
      console.error('Failed to create task:', err)
      alert('Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete a task
  async function deleteTask(taskId: number) {
    try {
      const { error } = await client.from('tasks').delete().eq('id', taskId)
      if (error) throw error
      refresh()
    } catch (err) {
      console.error('Failed to delete task:', err)
      alert('Failed to delete task')
    }
  }

  if (!userLoaded || loading) return <p>Loading...</p>
  if (!user) return <p>Please sign in</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">My Tasks</h1>

      {/* Create Task Form */}
      <form onSubmit={createTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="Enter new task"
          className="flex-1 border rounded px-3 py-2"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newTaskName.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </form>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center border rounded p-3"
            >
              <span>{task.name}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Debug: Show current user ID */}
      <div className="text-xs text-gray-400 mt-4">
        User ID: {user.id}
      </div>
    </div>
  )
}

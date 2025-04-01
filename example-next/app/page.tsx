"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Todo } from "./components/Todo";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { LogOut, Trash2 } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/auth-client";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.example.getCurrentUser);
  const deleteAccount = useMutation(api.example.deleteAccount);

  if (isLoading || user === undefined) {
    return <div className="text-neutral-400">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Please sign in</div>;
  }

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      await deleteAccount();
      await authClient.deleteUser();
    }
  };

  return (
    <div className="min-h-screen w-full p-4 space-y-8">
      <header className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-200 font-medium">
              {user.name[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-medium">{user.name}</h1>
            <p className="text-sm text-neutral-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={handleDeleteAccount}>
            <Trash2 size={16} className="mr-2" />
            Delete Account
          </Button>
          <Button variant="ghost" onClick={() => authClient.signOut()}>
            <LogOut size={16} className="mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main>
        <TodoList />
      </main>
    </div>
  );
}

function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const todos = useQuery(api.todos.get) ?? [];
  const create = useMutation(api.todos.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    await create({ text: newTodo.trim() });
    setNewTodo("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
        />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>

      <ul className="space-y-3">
        {todos.map((todo) => (
          <Todo
            key={todo._id}
            id={todo._id}
            text={todo.text}
            completed={todo.completed}
          />
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="text-center text-neutral-500 py-8">
          No todos yet. Add one above!
        </p>
      )}
    </div>
  );
}

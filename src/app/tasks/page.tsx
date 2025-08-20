"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function TasksPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [tasks, setTasks] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Get user session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/"); // Redirect to login if no session
      } else {
        setUserId(data.session.user.id);
        fetchTasks(data.session.user.id);
      }
    });
  }, []);

  // fetch tasks owned by current user
  async function fetchTasks(ownerId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("owner", ownerId)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setTasks(data || []);
  }

  // add new task with owner
  async function addTask() {
    if (!newTitle.trim() || !userId) return;

    const { error } = await supabase.from("tasks").insert([
      {
        title: newTitle,
        description: newDescription,
        status: "todo",
        owner: userId,
      },
    ]);

    if (error) console.error(error);
    else {
      setNewTitle("");
      setNewDescription("");
      fetchTasks(userId);
    }
  }

  // update task status (only own tasks due to RLS)
  async function updateTaskStatus(id: string, status: string) {
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", id);

    if (error) console.error(error);
    else if (userId) fetchTasks(userId);
  }

  // delete task
  async function deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) console.error(error);
    else if (userId) fetchTasks(userId);
  }

  // logout user
  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">My Tasks</h1>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Add Task Form */}
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Task title..."
          className="border px-3 py-2 rounded text-black"
        />
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Task description..."
          className="border px-3 py-2 rounded text-black"
        />
        <button
          onClick={addTask}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
      </div>

      {/* Task List */}
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="border p-3 rounded flex flex-col gap-2 bg-white shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-black">{task.title}</p>
                <p className="text-sm text-gray-600">{task.description}</p>
                <p className="text-xs text-gray-500">Status: {task.status}</p>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>

            <div className="flex gap-2">
              {["todo", "doing", "done"].map((status) => (
                <button
                  key={status}
                  onClick={() => updateTaskStatus(task.id, status)}
                  className={`px-3 py-1 rounded ${
                    task.status === status
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


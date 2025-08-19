"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type Task = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  created_at: string;
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  //  logout function
  const logout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/login");
  };

  // fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabaseBrowser
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setTasks(data as Task[]);
    };

    fetchTasks();
  }, []);

  // add task
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask) return;

    const user = (await supabaseBrowser.auth.getUser()).data.user;
    if (!user) return router.push("/login");

    const { data, error } = await supabaseBrowser.from("tasks").insert([
      { title: newTask, status: "todo", owner: user.id },
    ]).select();

    if (!error && data) {
      setTasks([...(tasks || []), ...data]);
      setNewTask("");
    }
  };

  //  update task status
  const updateStatus = async (task: Task) => {
    const nextStatus =
      task.status === "todo" ? "doing" : task.status === "doing" ? "done" : "todo";

    const { data, error } = await supabaseBrowser
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", task.id)
      .select();

    if (!error && data) {
      setTasks(tasks.map((t) => (t.id === task.id ? data[0] : t)));
    }
  };

  //  delete task
  const deleteTask = async (id: string) => {
    const { error } = await supabaseBrowser.from("tasks").delete().eq("id", id);
    if (!error) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <button
          onClick={logout}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          Logout
        </button>
      </div>

      <form onSubmit={addTask} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task..."
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="p-3 border rounded flex justify-between items-center"
          >
            <div>
              <span className="font-medium">{task.title}</span>
              <span className="ml-2 text-sm text-gray-500">
                [{task.status}]
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus(task)}
                className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Next
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

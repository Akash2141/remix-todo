import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { db } from "~/utils/db.server";

const todo_status_options = ["inprogress", "onhold", "completed"];

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader() {
  console.log("this is the loader::");
  const todos = await db.todo.findMany({
    include: {
      category: true,
      subtasks: true,
      userrating: true,
    },
  });
  return { todos };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const id = formData.get("id");
  const title = formData.get("title") as string;
  const status = formData.get("status") as string;
  const userId = Number(formData.get("userId")) as number;
  const categoryId = Number(formData.get("categoryId")) as number;
  switch (request.method) {
    case "POST": {
      await db.todo.create({
        data: {
          title,
          status,
          userId,
          categoryId,
        },
      });
      break;
    }
    case "PUT": {
      await db.todo.update({
        where: { id: Number(id) },
        data: {
          title,
          status,
          userId,
          categoryId,
        },
      });
      break;
    }
  }
  return { status: "completed" };
}

export default function Index() {
  const { todos, categories } = useLoaderData();
  const submit = useSubmit();
  // view will have 3 options: list,table,kanban
  const [state, setState] = useState({
    todos: [],
    kanbanViewTodos: [[], {}],
    view: "kanban",
  });
  useEffect(() => {
    switch (state.view) {
      case "kanban": {
        const kanbanTodos = todos?.reduce(
          (acc, todo) => {
            if (!acc[1][todo.status]) {
              acc[0].push(todo.status);
              acc[1][todo.status] = [];
            }
            acc[1][todo.status].push(todo);
            return acc;
          },
          [[], {}]
        );
        console.log("kanbantodos::", kanbanTodos);
        setState((prev) => ({ ...prev, kanbanViewTodos: kanbanTodos }));
      }
    }
  }, [todos, state.view]);

  function onDragStart(e, todo) {
    e.dataTransfer.setData("todo", JSON.stringify(todo));
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  async function onDrop(e, todo_status) {
    e.preventDefault();
    const todo = JSON.parse(e.dataTransfer.getData("todo"));
    let formData = new FormData();
    formData.set("id", todo.id);
    formData.set("title", todo.title);
    formData.set("status", todo_status);
    formData.set("userId", todo.userId);
    formData.set("categoryId", todo.categoryId);
    submit(formData, { method: "put" }, { replace: true });
  }

  return (
    <div>
      <Form method="post" replace>
        <input type="text" name="title" placeholder="Todo Title" />
        <br />
        <br />
        <input type="text" name="status" placeholder="Status" />
        <br />
        <br />
        <input type="text" name="userId" placeholder="userId" />
        <br />
        <br />
        <input type="text" name="categoryId" placeholder="categoryId" />
        <br />
        <br />
        <button type="submit">Submit</button>
      </Form>
      {state.view == "kanban" && (
        <div className="kanbanview">
          {todo_status_options?.map((todo_status) => {
            return (
              <div
                className="todo-status-parent"
                onDragOver={onDragOver}
                onDrop={(e) => {
                  onDrop(e, todo_status);
                }}
              >
                <h2>{todo_status}</h2>
                {state.kanbanViewTodos[1][todo_status]?.map((todo) => {
                  return (
                    <div
                      draggable="true"
                      onDragStart={(e) => {
                        onDragStart(e, todo);
                      }}
                    >
                      {todo?.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

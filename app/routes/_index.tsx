import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { Form,useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { db } from "~/utils/db.server";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader(){
  const todos = await db.todo.findMany({
    include: {
      category: true,
      subtasks: true,
      userrating: true,
    }
  });
  return {todos}
}

export async function action({request}:ActionArgs){
  const formData = await request.formData();
  const title=formData.get("title") as string;
  const status=formData.get('status') as string;
  const userId=Number(formData.get('userId')) as number;
  const categoryId=Number(formData.get('categoryId')) as number;
  const user=await db.todo.create({
    data:{
      title,
      status,
      userId,
      categoryId
    },
  })
  console.log("this is the user::",user);
  return false
}

export default function Index() {
  const {todos, categories} = useLoaderData();
  console.log("this is the todos::",todos);
  // view will have 3 options: list,table,kanban
  const [state,setState]=useState({todos:[],kanbanViewTodos:[[],{}],view:"kanban"})
  useEffect(()=>{
    switch(state.view){
      case 'kanban':{
        const kanbanTodos=todos?.reduce((acc,todo)=>{
          if(!acc[1][todo.status]){
            acc[0].push(todo.status)
            acc[1][todo.status]=[]
          }
          acc[1][todo.status].push(todo);
          return acc;
        },[[],{}])
        console.log("kanbantodos::",kanbanTodos);
        setState((prev)=>({...prev,kanbanViewTodos:kanbanTodos}))
      }
    }
  },[todos,state.view])

  function onDragStart(e,todo){
    console.log("drag start todo::",todo)
    e.dataTransfer.setData("todo", JSON.stringify(todo));
  }
  
  function onDragOver(e){
    e.preventDefault();
  }

  function onDrop(e,todo_status){
    e.preventDefault();
    const todo=e.dataTransfer.getData("todo");
    console.log(JSON.parse(todo),todo_status)
    setState((prev)=>{
console.log("before,",prev.kanbanViewTodos[1][todo_status])

      prev.kanbanViewTodos[1][todo_status].push(JSON.parse(todo));
console.log("prev,",prev.kanbanViewTodos[1][todo_status])
      return {...prev}
    })
  }
  
  return (
    <div>
      <Form method="post" replace>
          <input type="text" name="title" placeholder="Todo Title"/><br/><br/>
          <input type="text" name="status" placeholder="Status"/><br/><br/>
          <input type="text" name="userId" placeholder="userId"/><br/><br/>
          <input type="text" name="categoryId" placeholder="categoryId"/><br/><br/>
          <button type="submit">Submit</button>
      </Form>
      {
        state.view=='kanban'&&<div className="kanbanview">
          {
            state.kanbanViewTodos[0]?.map((todo_status)=>{
              return (
                <div onDragOver={onDragOver} onDrop={(e)=>{onDrop(e,todo_status)}}>
                  <h2>{todo_status}</h2>
                  {
                    state.kanbanViewTodos[1][todo_status]?.map((todo)=>{
                      return <div draggable="true" onDragStart={(e)=>{onDragStart(e,todo)}}>
                        {todo?.title}
                      </div>
                    })
                  }
                </div>
              )
            })
          }
        </div>
      }
    </div>
  );
}

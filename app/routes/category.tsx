import { ActionArgs } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import { db } from "~/utils/db.server";

export async function action({request}:ActionArgs){
    const formData = await request.formData();
    const title=formData.get("title") as string;
    const user=await db.category.create({
      data:{
        title
      }
    })
    return false
  }

export default function Category() {
    const navigation=useNavigation();
    return (
      <div>
        <h1 className="text-center">Category</h1><br/>
        <Form method="POST">
          <input type = 'text' name ='title' placeholder="Title" /><br/><br/>
          <button className="btn btn-primary"type="submit">Submit</button>&nbsp;&nbsp;
        </Form>
      </div>
    );
  }
import { ActionArgs, redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { db } from "~/utils/db.server";

export async function action({request}:ActionArgs){
  const formData = await request.formData();
  const email=formData.get("email") as string;
  const password=formData.get("password") as string;
  const user=await db.user.findFirst({
    where:{
      email,
      password
    }
  })
  if(!user) return {
    status:'Failed',
    reponse:'Invalid Credentials'
  }
  return redirect("/")
}


export default function Login() {
    return (
      <div>
        <h1 className="text-center">Login</h1><br/>
        <Form method="POST">
          <label htmlFor='email'>Email: </label>
          <input type = 'email' name ='email' id= "email" placeholder="<EMAIL>" /><br/><br/>
          <label htmlFor='password'>Password:</label>
          <input  type ="password"name ="password"id="password"/><br/><br/>
          <button className="btn btn-primary"type="submit">Submit</button>&nbsp;&nbsp;
          <button type="button" > <Link to="/signin">Sign Up!</Link></button>
        </Form>
      </div>
    );
  }
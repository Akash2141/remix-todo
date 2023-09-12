import { ActionArgs, redirect } from "@remix-run/node";
import { Form,Link,useNavigation } from "@remix-run/react";
import { db } from "~/utils/db.server";

export async function action({request}:ActionArgs){
    const formData = await request.formData();
    const email=formData.get("email") as string;
    const password=formData.get("password") as string;
    await db.user.create({
        data:{
            email:email,
            username:email,
            password:password
        }
    })
    return redirect("/login")
}

export default function Signin(){
    const navigation = useNavigation();
    return (
        <div>
            <h1 className="text-center">Sign Up</h1><br/>
            <Form method="POST">
                <label htmlFor='email'>Email:</label>&nbsp;
                <input type = 'email' name ='email' placeholder="Email"/>
                <br/><br/>
                <label htmlFor='password'>Password:&nbsp;</label>&nbsp;&nbsp;
                <input type="password" name="password" placeholder="Password"/>
                <br/><br/>
                <button type="submit" className="btn btn-primary">Submit</button>
                <button type="button"><Link to="/login">Login</Link></button>
            </Form>
        </div>
    )
}
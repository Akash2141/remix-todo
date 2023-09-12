import type { V2_MetaFunction } from "@remix-run/node";
import { db } from "~/utils/db.server";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div>Hii</div>
  );
}

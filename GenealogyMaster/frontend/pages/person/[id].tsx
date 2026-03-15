import { useRouter } from "next/router";

export default function PersonPage() {
  const router = useRouter();
  return <main><h1>Person {router.query.id}</h1></main>;
}

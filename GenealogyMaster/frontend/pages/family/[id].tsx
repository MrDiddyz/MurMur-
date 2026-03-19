import { useRouter } from "next/router";

export default function FamilyPage() {
  const router = useRouter();
  return <main><h1>Family {router.query.id}</h1></main>;
}

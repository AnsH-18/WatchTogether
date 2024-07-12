import { TabsDemo } from "@/components/Tabs";

export default function Home() {
  console.log("client")
  return (
    <div className="min-h-screen flex md:justify-center items-center md:px-48 sm:px-20 px-10">
      <TabsDemo/>
    </div>
  );
}
  
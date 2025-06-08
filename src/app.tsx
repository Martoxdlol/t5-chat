import { useQuery } from "@tanstack/react-query";
import { Button } from "./components/ui/button";
import { useTRPC } from "./lib/api-client";

export default function App() {
    const trpc = useTRPC()

    const { data } = useQuery(trpc.hello.queryOptions())

    return <Button>
        {data}
    </Button>
}

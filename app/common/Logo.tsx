import { cn } from "@/lib/utils"
import { Scissors } from "lucide-react"
import Link from "next/link"

export const Logo=({className}:{className?:string})=>{
    return(
        <Link href={"/"} className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <span className={cn("font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary via-violet-500 to-fuchsia-500",className)}>Shorty.</span>
          </Link>
    )
}
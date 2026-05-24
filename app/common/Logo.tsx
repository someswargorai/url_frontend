import { cn } from "@/lib/utils"
import { Scissors } from "lucide-react"
import Link from "next/link"

export const Logo=({className}:{className?:string})=>{
    return(
        <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110"
              style={{ background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.2)" }}
            >
              <Scissors
                className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12"
                style={{ color: "#00e5a0" }}
                strokeWidth={1.5}
              />
            </div>
            <span
              className="font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "18px",
                letterSpacing: "-0.5px",
              }}
            >
              Shorty<span style={{ color: "#00e5a0" }}>.</span>
            </span>
          </Link>
    )
}
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

export default function QR({ shortUrl }:{
    shortUrl: string
}) {

   const [qr, setQr] = useState("");

   useEffect(() => {

      const fetchQr = async () => {
         try {
            const data = await QRCode.toDataURL(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/${shortUrl}`)
            setQr(data);
         } catch (error) {
            console.error(error)
         }
      }
      fetchQr();

      
   }, [shortUrl]);

   return (
     <div className="relative flex flex-col items-center gap-5 p-6 rounded-2xl ">

    {/* Ambient corner glows */}
    <div className="pointer-events-none absolute -top-8 -left-8 w-32 h-32 rounded-full bg-blue-500/[0.08] blur-2xl" />
    <div className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-indigo-500/[0.07] blur-2xl" />

    {/* QR frame */}
    <div className="relative group">
        {/* Animated border ring */}
        <div className="absolute -inset-[3px] rounded-2xl bg-gradient-to-br from-blue-400/30 via-indigo-400/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]" />

        {/* Inner card */}
        <div className="relative rounded-[14px] bg-white p-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            {/* Corner accents */}
            <span className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-blue-500/60 rounded-tl-md" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-blue-500/60 rounded-tr-md" />
            <span className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-blue-500/60 rounded-bl-md" />
            <span className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-blue-500/60 rounded-br-md" />

            <Image
                width={200}
                height={200}
                src={qr}
                alt="QR Code"
                className="rounded-lg block"
            />
        </div>
    </div>

    {/* Label */}
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        Scan to visit link
    </p>

    {/* Download button */}
   <a
    href={qr}
    download={`${shortUrl}-qr.png`}
    className="group/btn relative w-full overflow-hidden rounded-sm"
>
    {/* Shimmer */}
    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/8 to-transparent" />

    <button className="
        relative w-full flex items-center justify-center gap-2.5
        px-5 py-3 rounded-sm cursor-pointer
        bg-white/6
        border border-white/12
        hover:bg-white/10 hover:border-white/22
        text-zinc-400 
        transition-all duration-300
        shadow-[0_0_0_0_rgba(255,255,255,0)] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]
        text-sm font-semibold tracking-wide
    ">
        <Download className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-110" />
        Download QR
    </button>
</a>
</div>
   );
}
import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface Props {
  params: Promise<{
    shortUrl: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { shortUrl } = await params;
  const headerList = await headers();
  const host = headerList.get("host") || "";

  
  redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/get-url/${shortUrl}?domain=${encodeURIComponent(host)}`
  );
}
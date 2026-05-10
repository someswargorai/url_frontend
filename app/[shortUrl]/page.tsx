import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    shortUrl: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { shortUrl } = await params;

  redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/get-url/${shortUrl}`
  );
}
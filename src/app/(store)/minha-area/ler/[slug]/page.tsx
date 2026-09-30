import { notFound } from "next/navigation";
import { EbookReader } from "@/components/customer/ebook-reader";
import { getProtectedEbook } from "@/lib/customer/data";

export default async function ReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProtectedEbook(slug);
  if (!data) notFound();
  return <EbookReader product={data.product} chapters={data.chapters} initialChapterId={data.progress?.chapter_id} watermark={data.watermark} />;
}

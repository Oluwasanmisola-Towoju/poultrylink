import Image, { type StaticImageData } from "next/image";
import { Chick } from "@/components/brand/chick";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  image,
  imageAlt,
  children,
}: {
  title: string;
  description: string;
  image?: StaticImageData;
  imageAlt?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          {image ? (
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-foreground pixel-shadow">
              <Image src={image} alt={imageAlt ?? ""} fill placeholder="blur" sizes="80px" className="object-cover" />
            </div>
          ) : (
            <Chick phase="still" scale={1.3} />
          )}
        </div>
        <Card className="pixel-shadow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
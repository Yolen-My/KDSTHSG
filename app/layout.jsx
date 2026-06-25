import "./globals.css";
import LanguageProvider from "@/components/LanguageProvider";

export const metadata = {
  title: "Offsite Games",
  description: "Interactive HSG game flow built with Next.js and React"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

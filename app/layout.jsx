import "./globals.css";
import { LocaleProvider } from "@/lib/i18n";

export const metadata = {
  title: "Offsite Games",
  description: "Interactive HSG game flow built with Next.js and React"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}

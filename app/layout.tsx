import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import {Toaster} from "sonner";
import {Navigation} from "@/components/navigation";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Management App",
    description: "A simple management application",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en-GB" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <Navigation/>
            <main>{children}</main>
            <Toaster position="top-right"/>
        </ThemeProvider>
        </body>
        </html>
    );
}
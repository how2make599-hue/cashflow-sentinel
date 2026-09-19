import "./globals.css";
import type { Metadata } from "next";
export const metadata:Metadata={title:"Estimate | Group Commercial Engine",description:"Controlled estimating and commercial modelling platform"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

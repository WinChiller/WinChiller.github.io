import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReviewChess - AI-powered Chess Analysis & Playstyle Insights',
  description: 'Analyze your chess games with Stockfish, understand your playstyle, and improve your performance with data-driven insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-blue-900 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold">ReviewChess</span>
            </div>
            <nav>
              <ul className="flex space-x-6">
                <li><a href="/" className="hover:text-blue-300">Home</a></li>
                <li><a href="/dashboard" className="hover:text-blue-300">Dashboard</a></li>
                <li><a href="/analysis" className="hover:text-blue-300">Analyze</a></li>
                <li><a href="/about" className="hover:text-blue-300">About</a></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main className="min-h-screen">
          {children}
        </main>
        
        <footer className="bg-gray-800 text-white p-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">ReviewChess</h3>
                <p className="text-gray-300">
                  AI-powered chess analysis and playstyle insights to help you improve your game.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Links</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="/terms" className="hover:text-blue-300">Terms of Service</a></li>
                  <li><a href="/privacy" className="hover:text-blue-300">Privacy Policy</a></li>
                  <li><a href="/contact" className="hover:text-blue-300">Contact Us</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Connect</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-blue-300">Twitter</a>
                  <a href="#" className="text-gray-300 hover:text-blue-300">Discord</a>
                  <a href="#" className="text-gray-300 hover:text-blue-300">GitHub</a>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} ReviewChess. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
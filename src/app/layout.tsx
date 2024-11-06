import './globals.css';

export const metadata = {
  title: 'Client Timer History',
  description: 'Track and review client timer logs easily.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className="bg-gray-800 text-gray-100 flex flex-col min-h-screen">
        <main className="flex-grow flex justify-center items-center">
          {children}
        </main>
        <footer className="bg-gray-900 text-gray-400 py-4 flex justify-center items-center">
          <img src="/clarity512x512.png" alt="Clarity Logo" className="h-20 mr-2" />
          <div className="py-4 flex flex-col items-center">
            <p>Clarity Business Solutions</p>
            <p>automation * integration * insight</p>
            <p className="text-xs">(778) 678-3674</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import './globals.css';
import { SayPulseProvider } from '@saypulse/react';
import { ClientShell } from './components/ClientShell';

export const metadata: Metadata = {
  title: 'Acme Analytics & SayPulse Admin',
  description: 'AI Voice Feedback Intelligence Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const apiUrl = process.env.NEXT_PUBLIC_SAYPULSE_API_URL ?? '';
  const apiKey = process.env.NEXT_PUBLIC_SAYPULSE_KEY ?? 'sp_dev_local_master';

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0B1120' }}>
        <SayPulseProvider apiKey={apiKey} apiEndpoint={apiUrl}>
          <ClientShell>
            {children}
          </ClientShell>
        </SayPulseProvider>
      </body>
    </html>
  );
}

import { Inter } from 'next/font/google';
import './globals.css';
import AuthSession from '../providers/SessionProvider';
import StyledComponentsRegistry from '../providers/StyledProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <AuthSession>{children}</AuthSession>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

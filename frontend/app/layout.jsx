import '@xyflow/react/dist/style.css';
import './globals.css';

export const metadata = {
  title: 'Informatics Engineering · UTB',
  description:
    'Bachelor of Science in Informatics Engineering — University of Technology Bahrain. Curriculum tree, career tracks, and student toolkit.',
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body className="bg-void text-[#e9edf3] antialiased">{children}</body>
    </html>
  );
}

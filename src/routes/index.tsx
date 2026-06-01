import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@/components/home/Home';

// Public marketing landing page. (Signed-in visitors see it too and can head
// into the app via the CTAs — no auth gate here.)
export const Route = createFileRoute('/')({
  component: Home,
});

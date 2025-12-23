import { GuestHeader } from "@/components/layout/guest-header"
import { GuestFooter } from "@/components/layout/guest-footer"

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <GuestHeader />
      <main className="flex-1">{children}</main>
      <GuestFooter />
    </div>
  )
}

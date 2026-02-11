export function GuestFooter() {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} GastroPay. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

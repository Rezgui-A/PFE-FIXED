import Image from "next/image"

export function EricssonHeader() {
  return (
    <header className="bg-ericsson-navy/90 backdrop-blur-sm border-b border-ericsson-border/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="relative h-10 w-32">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-wS0sYcrFdhmH8QlD9jPDEAz0OZPLB3.png"
                alt="Ericsson Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block ml-3">
              <span className="text-xl font-semibold text-white">
                Data <span className="text-ericsson-accent">Visualization</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

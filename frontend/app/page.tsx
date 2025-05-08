import { DashboardUploader } from "@/components/dashboard-uploader"
import { AnalysisAssistant } from "@/components/analysis-assistant"
import { EricssonHeader } from "@/components/ericsson-header"

export default function Home() {
  return (
    <div className="min-h-screen text-ericsson-text">
      <EricssonHeader />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8 text-white text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-ericsson-blue to-ericsson-accent">
            Ericsson Data Visualization
          </span>
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <DashboardUploader />
          </div>
          <div className="lg:col-span-7">
            <AnalysisAssistant />
          </div>
        </div>
      </div>
    </div>
  )
}

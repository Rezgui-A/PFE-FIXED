import { BarChart3, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GrafanaHeader() {
  return (
    <header className="bg-grafana-header border-b border-grafana-border">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <BarChart3 className="h-7 w-7 text-grafana-blue mr-2" />
              <span className="text-xl font-semibold text-white">TelecomViz</span>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="text-grafana-text-secondary hover:text-white hover:bg-grafana-hover">
                Dashboards
              </Button>
              <Button variant="ghost" className="text-grafana-text-secondary hover:text-white hover:bg-grafana-hover">
                Explore
              </Button>
              <Button variant="ghost" className="text-grafana-text-secondary hover:text-white hover:bg-grafana-hover">
                Alerts
              </Button>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5 text-grafana-text-secondary" />
            </Button>
            <Button
              variant="outline"
              className="hidden md:flex bg-grafana-button border-grafana-border text-white hover:bg-grafana-button-hover"
            >
              Help
            </Button>
            <Button className="hidden md:flex bg-grafana-blue hover:bg-grafana-blue-hover text-white">
              New Dashboard
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

import { Maximize, Minimize, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui"

export function WindowControls() {
  const [capabilities, setCapabilities] = useState({ canMinimize: true, canMaximize: true })

  useEffect(() => {
    window.electronAPI?.getWindowCapabilities().then(caps => setCapabilities(caps))
  }, [])

  const handleMinimize = () => {
    window.electronAPI?.windowMinimize()
  }

  const handleMaximize = () => {
    window.electronAPI?.windowMaximize()
  }

  const handleClose = () => {
    window.electronAPI?.windowClose()
  }

  return (
    <div className="flex items-center gap-1">
      {capabilities.canMinimize && (
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={handleMinimize}
          title="Minimize"
        >
          <Minimize className="h-4 w-4" />
        </Button>
      )}
      {capabilities.canMaximize && (
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={handleMaximize}
          title="Maximize"
        >
          <Maximize className="h-4 w-4" />
        </Button>)}
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        onClick={handleClose}
        title="Close"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

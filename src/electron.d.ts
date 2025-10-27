/**
 * Type definitions for Electron IPC API
 *
 * File saving strategy:
 * - Files are saved to the app's project directory (where the app runs)
 * - If file exists, it gets overwritten
 * - No user dialog for location - always same directory
 */

interface ElectronAPI {
  /**
   * Salva un file nella directory del progetto
   * Sovrascrive se esiste già
   *
   * @param filename Nome del file (es. "theme.json", "properties.config.json")
   * @param content Contenuto del file come stringa
   * @returns Percorso completo del file salvato
   */
  saveFile(filename: string, content: string): Promise<string>

  /**
   * Carica un file dalla directory del progetto
   * @param filename Nome del file da caricare
   * @returns Contenuto del file come stringa
   */
  loadFile(filename: string): Promise<string>

  /**
   * Legge un file dalla directory del progetto
   * @param filename Nome del file da leggere
   * @returns Contenuto del file come stringa
   */
  readFile(filename: string): Promise<string>

  /**
   * Lista tutti i file JSON nella directory del progetto
   * @returns Array di nomi file
   */
  listFiles(): Promise<string[]>

  /**
   * Apre il dialog di selezione file nativo
   * @returns Oggetto con filePath e content, o null se cancellato
   */
  openFileDialog(): Promise<{ filePath: string; content: string } | null>

  /**
   * Verifica le capacità del window manager
   * @returns Oggetto con flag per minimize/maximize
   */
  getWindowCapabilities(): Promise<{ canMinimize: boolean; canMaximize: boolean }>

  /**
   * Minimizza la finestra (no-op su tiling window managers)
   */
  windowMinimize(): Promise<void>

  /**
   * Massimizza/ripristina la finestra
   */
  windowMaximize(): Promise<void>

  /**
   * Chiude la finestra
   */
  windowClose(): Promise<void>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}

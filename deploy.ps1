# deploy.ps1 — Build y empaquetar para beewh
# Uso: .\deploy.ps1
# Genera deploy.zip listo para subir y extraer en /home2/revista1/revistalaboratorio/

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Revista Laboratorio — Build para beewh ===" -ForegroundColor Cyan
Write-Host ""

# 1. Build
Write-Host "[1/4] Buildeando..." -ForegroundColor Yellow
npm run build
if (-not $?) { Write-Host "Build fallido." -ForegroundColor Red; exit 1 }

# 2. Copiar archivos estáticos al standalone
Write-Host "[2/4] Copiando archivos estáticos al standalone..." -ForegroundColor Yellow

$staticSrc  = ".next\static"
$staticDest = ".next\standalone\.next\static"
if (Test-Path $staticSrc) {
    if (Test-Path $staticDest) { Remove-Item $staticDest -Recurse -Force }
    Copy-Item $staticSrc $staticDest -Recurse
    Write-Host "    .next/static -> standalone/.next/static" -ForegroundColor Gray
}

# 3. Copiar public/ al standalone (sin sobreescribir uploads existentes)
Write-Host "[3/4] Copiando public/ al standalone..." -ForegroundColor Yellow

$publicSrc  = "public"
$publicDest = ".next\standalone\public"
if (Test-Path $publicSrc) {
    if (-not (Test-Path $publicDest)) { New-Item $publicDest -ItemType Directory | Out-Null }
    # Copiar todo excepto la carpeta uploads (para no pisar imagenes del servidor)
    Get-ChildItem $publicSrc | Where-Object { $_.Name -ne "uploads" } | ForEach-Object {
        Copy-Item $_.FullName (Join-Path $publicDest $_.Name) -Recurse -Force
    }
    # Crear carpeta uploads vacia si no existe en el destino
    $uploadsDir = Join-Path $publicDest "uploads"
    if (-not (Test-Path $uploadsDir)) {
        New-Item $uploadsDir -ItemType Directory | Out-Null
        New-Item (Join-Path $uploadsDir ".gitkeep") -ItemType File | Out-Null
    }
    Write-Host "    public/ -> standalone/public/ (uploads preservados)" -ForegroundColor Gray
}

# 4. Empaquetar en deploy.zip
Write-Host "[4/4] Empaquetando en deploy.zip..." -ForegroundColor Yellow

$zipPath = "deploy.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Compress-Archive -Path ".next\standalone\*" -DestinationPath $zipPath -CompressionLevel Optimal

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
Write-Host ""
Write-Host "=== Listo! ===" -ForegroundColor Green
Write-Host ""
Write-Host "  Archivo: deploy.zip ($sizeMB MB)" -ForegroundColor White
Write-Host ""
Write-Host "  Pasos para deployar en beewh:" -ForegroundColor Cyan
Write-Host "  1. Subir deploy.zip al File Manager de cPanel"
Write-Host "     Ruta destino: /home2/revista1/revistalaboratorio/"
Write-Host "  2. Extraer el zip ahi mismo (Extract en File Manager)"
Write-Host "  3. En Node.js Selector -> reiniciar la app"
Write-Host ""

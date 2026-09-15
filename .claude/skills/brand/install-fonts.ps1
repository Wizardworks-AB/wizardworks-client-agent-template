# Install the Inter typeface for /document and /deck (Windows, per user, no admin).
# Fonts are binaries and cannot travel inside the agent template, so this
# fetches the official release from GitHub and registers the variable fonts.
#
#   powershell -ExecutionPolicy Bypass -File .claude\skills\brand\install-fonts.ps1
$ErrorActionPreference = 'Stop'

if (Get-Command typst -ErrorAction SilentlyContinue) {
  if ((typst fonts) -match '^Inter$') { Write-Host 'Inter is already installed.'; exit 0 }
}

$version = if ($env:INTER_VERSION) { $env:INTER_VERSION } else { '4.1' }
$url = "https://github.com/rsms/inter/releases/download/v$version/Inter-$version.zip"
$tmp = Join-Path $env:TEMP ("inter-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $tmp | Out-Null
try {
  Write-Host "Downloading Inter $version …"
  Invoke-WebRequest -Uri $url -OutFile (Join-Path $tmp 'inter.zip')
  Expand-Archive -Path (Join-Path $tmp 'inter.zip') -DestinationPath (Join-Path $tmp 'inter')

  $dest = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
  New-Item -ItemType Directory -Path $dest -Force | Out-Null
  $reg = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
  if (-not (Test-Path $reg)) { New-Item -Path $reg -Force | Out-Null }

  Get-ChildItem -Path (Join-Path $tmp 'inter') -Recurse -Filter 'Inter*Variable*.ttf' | ForEach-Object {
    $target = Join-Path $dest $_.Name
    Copy-Item $_.FullName $target -Force
    # Per-user font registration: the value name is the face name, the value the file path.
    New-ItemProperty -Path $reg -Name ($_.BaseName + ' (TrueType)') -Value $target -PropertyType String -Force | Out-Null
  }
  Write-Host "Installed Inter into $dest (sign out and in if an application does not see it yet)."
} finally {
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}

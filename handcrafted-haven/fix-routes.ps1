# -- SAFETY: commit first! --
# git add . && git commit -m "backup before route signature mass update"

# PowerShell script to update route handler signatures in src/app/api
Get-ChildItem -Path .\src\app\api -Recurse -Include route.ts,route.js | ForEach-Object {
  $file = $_.FullName
  $text = Get-Content -Raw -Path $file

  # Quick backup
  Copy-Item -Path $file -Destination ($file + ".bak") -Force

  $updated = $false

  # 1) Ensure NextRequest is imported alongside NextResponse if file imports from next/server
  if ($text -match "from\s+['""]next\/server['""]") {
    if ($text -notmatch "NextRequest") {
      # add NextRequest to the named imports
      $text = $text -replace "import\s*\{\s*([^\}]*NextResponse[^\}]*)\}\s*from\s*['""]next\/server['""]", 'import { NextRequest, $1 } from "next/server"'
      $updated = $true
    }
  }

  # 2) Replace GET signature that destructures params in the param list
  # Pattern looks for: export async function GET(_: Request, { params }: { params: { <inner> } })
  $pattern = 'export\s+async\s+function\s+GET\(\s*[^,]+\s*,\s*\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*([^}]*)\}\s*\}\s*\)'
  $regex = [regex] $pattern
  if ($regex.IsMatch($text)) {
    $inner = $regex.Match($text).Groups[1].Value.Trim()
    $newSig = "export async function GET(_: NextRequest, context: { params: Promise<{ $inner }> })"
    $text = $regex.Replace($text, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $newSig })
    $updated = $true
  }

  # 3) Replace synchronous param extraction with awaited context.params
  # from: const { id } = params;
  # to:   const { id } = await context.params;
  $textNew = [regex]::Replace($text, 'const\s*\{\s*([^}]+)\s*\}\s*=\s*params\s*;', 'const { $1 } = await context.params;')
  if ($textNew -ne $text) {
    $text = $textNew
    $updated = $true
  }

  if ($updated) {
    Set-Content -Path $file -Value $text -Force
    Write-Host "Updated: $file (backup: $file.bak)"
  } else {
    Write-Host "No changes: $file"
  }
}

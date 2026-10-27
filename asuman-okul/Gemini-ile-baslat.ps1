$ErrorActionPreference = 'Stop'
$secureGeminiKey = Read-Host 'Yeni Gemini API anahtarınızı girin (gizli, dosyaya kaydedilmez)' -AsSecureString
$geminiPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureGeminiKey)
try {
    $env:GEMINI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($geminiPointer)
    if ([string]::IsNullOrWhiteSpace($env:GEMINI_API_KEY)) { throw 'Anahtar boş olamaz.' }
    & 'C:\Users\ASUMAN\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' (Join-Path $PSScriptRoot 'preview.cjs')
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($geminiPointer)
    Remove-Item Env:GEMINI_API_KEY -ErrorAction SilentlyContinue
    $secureGeminiKey.Dispose()
}

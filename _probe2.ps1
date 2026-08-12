$urls = @('/', '/api', '/api/health', '/api/properties', '/api/properties/executive-corner-plot-e60d73')
foreach ($u in $urls) {
  $status = 'ERR'
  $snippet = ''
  try {
    $r = Invoke-WebRequest -Uri ("https://wato-backend.vercel.app" + $u) -TimeoutSec 25 -ErrorAction Stop
    $status = $r.StatusCode
    $snippet = $r.Content
  } catch {
    $status = 'HTTP ' + $_.Exception.Response.StatusCode.value__
    $snippet = $_.Exception.Message
  }
  if ($snippet.Length -gt 0) { $snippet = $snippet.Substring(0, [Math]::Min(140, $snippet.Length)) }
  Write-Output ("GET " + $u + " -> " + $status + " | " + $snippet)
}

$html = Get-Content "index.html" -Raw -Encoding UTF8
$css = Get-Content "css/style.css" -Raw -Encoding UTF8
$js = Get-Content "js/main.js" -Raw -Encoding UTF8

# Replace Font in CSS
$fontPath = "assets/fonts/RedRose-VariableFont_wght.ttf"
if (Test-Path $fontPath) {
    $fontBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $fontPath))
    $fontBase64 = [Convert]::ToBase64String($fontBytes)
    $css = $css -replace "\.\./assets/fonts/RedRose-VariableFont_wght\.ttf", "data:font/ttf;base64,$fontBase64"
}

# Combine into HTML
$html = $html -replace '(?s)<link rel="stylesheet" href="./css/style.css">', "<style>`n$css`n</style>"
$html = $html -replace '(?s)<script src="./js/main.js"></script>', "<script>`n$js`n</script>"

# Replace All Images dynamically
$images = Get-ChildItem -Path "assets/images" -Include *.png, *.jpg, *.jpeg -Recurse

foreach ($imgFile in $images) {
    $img = $imgFile.Name
    $imgPath = $imgFile.FullName
    $imgBytes = [System.IO.File]::ReadAllBytes($imgPath)
    
    $mimeType = "image/png"
    if ($img -match "\.jpe?g$") { $mimeType = "image/jpeg" }

    $imgBase64 = [Convert]::ToBase64String($imgBytes)
    $escapedImg = [regex]::Escape($img)
    $html = $html -replace "\.?/?assets/images/$escapedImg", "data:$mimeType;base64,$imgBase64"
}

# Fetch and Inline CDN JS
$scripts = @(
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
    "https://cdn.jsdelivr.net/npm/lenis@1.3.19/dist/lenis.min.js",
    "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
)
foreach ($url in $scripts) {
    $scriptContent = (Invoke-WebRequest -Uri $url).Content
    # Replace literal to avoid regex corruption
    $html = $html.Replace("<script src=`"$url`"></script>", "<script>`n$scriptContent`n</script>")
}

# Fetch and Inline CDN CSS
$cssUrls = @(
    "https://cdn.jsdelivr.net/npm/lenis@1.3.19/dist/lenis.css",
    "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
)
foreach ($url in $cssUrls) {
    $cssContent = (Invoke-WebRequest -Uri $url).Content
    $html = $html.Replace("<link rel=`"stylesheet`" href=`"$url`" />", "<style>`n$cssContent`n</style>")
    $html = $html.Replace("<link rel=`"stylesheet`" href=`"$url`">", "<style>`n$cssContent`n</style>")
}

# Fetch Google Fonts
$googleUrl = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=Questrial&family=Raleway:wght@300;400;500;600&display=swap"
$googleCss = (Invoke-WebRequest -Uri $googleUrl -Headers @{"User-Agent"="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}).Content
$html = $html -replace "<link href=`"https://fonts.googleapis.com/css2\?[^`"]+`" rel=`"stylesheet`">", "<style>`n$googleCss`n</style>"

Set-Content -Path index_standalone.html -Value $html -Encoding utf8
Write-Host "Fully standalone generated!"

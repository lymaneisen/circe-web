$html = Get-Content "index.html" -Raw

# Replace Font
$fontPath = "assets/fonts/RedRose-VariableFont_wght.ttf"
if (Test-Path $fontPath) {
    $fontBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $fontPath))
    $fontBase64 = [Convert]::ToBase64String($fontBytes)
    $html = $html -replace "\.\./assets/fonts/RedRose-VariableFont_wght\.ttf", "data:font/ttf;base64,$fontBase64"
    Write-Host "Inlined Font"
}

# Replace Images
$images = @(
    "logo-isotipo.png",
    "logo-texto.png",
    "Gemini_Generated_Image_vyey0xvyey0xvyey.png",
    "Gemini_Generated_Image_9e2do99e2do99e2d.png",
    "Gemini_Generated_Image_ (19).png",
    "Gemini_Generated_Image_ (27).png",
    "Gemini_Generated_Image_571c5y571c5y571c.png",
    "Gemini_Generated_Image_pq31kupq31kupq31.png",
    "Gemini_Generated_Image_1f4xm61f4xm61f4x.png",
    "Gemini_Generated_Image_h4d1eh4d1eh4d1eh.png"
)

foreach ($img in $images) {
    $imgPath = "assets/images/$img"
    if (Test-Path $imgPath) {
        $imgBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $imgPath))
        $imgBase64 = [Convert]::ToBase64String($imgBytes)
        $escapedImg = [regex]::Escape($img)
        $html = $html -replace "\.?/?assets/images/$escapedImg", "data:image/png;base64,$imgBase64"
        Write-Host "Inlined $img"
    }
}

# Fetch and Inline CDN JS
$scripts = @(
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
    "https://cdn.jsdelivr.net/npm/lenis@1.3.19/dist/lenis.min.js"
)
foreach ($url in $scripts) {
    $scriptContent = (Invoke-WebRequest -Uri $url).Content
    $html = $html -replace "<script src=`"$url`"></script>", "<script>`n$scriptContent`n</script>"
    Write-Host "Inlined $url"
}

# Fetch and Inline CDN CSS
$cssUrl = "https://cdn.jsdelivr.net/npm/lenis@1.3.19/dist/lenis.css"
$cssContent = (Invoke-WebRequest -Uri $cssUrl).Content
$html = $html -replace "<link rel=`"stylesheet`" href=`"$cssUrl`">", "<style>`n$cssContent`n</style>"
Write-Host "Inlined Lenis CSS"

# Fetch Google Fonts CSS (will not inline woff2 files, just the CSS definitions)
$googleUrl = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=Questrial&family=Raleway:wght@300;400;500;600&display=swap"
$googleCss = (Invoke-WebRequest -Uri $googleUrl -Headers @{"User-Agent"="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}).Content
$html = $html -replace "<link href=`"https://fonts.googleapis.com/css2\?[^`"]+`" rel=`"stylesheet`">", "<style>`n$googleCss`n</style>"
Write-Host "Inlined Google Fonts CSS"

Set-Content -Path index_standalone.html -Value $html -Encoding utf8
Write-Host "Done!"

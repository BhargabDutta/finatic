Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path "assets\logo.png").Path
$source = [System.Drawing.Image]::FromFile($sourcePath)

$densities = @(
    @{ Name = "mipmap-mdpi"; Size = 48; FgSize = 108 },
    @{ Name = "mipmap-hdpi"; Size = 72; FgSize = 162 },
    @{ Name = "mipmap-xhdpi"; Size = 96; FgSize = 216 },
    @{ Name = "mipmap-xxhdpi"; Size = 144; FgSize = 324 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192; FgSize = 432 }
)

foreach ($d in $densities) {
    $dir = Join-Path "android\app\src\main\res" $d.Name
    
    # 1. Generate ic_launcher.png and ic_launcher_round.png
    $bmp = New-Object System.Drawing.Bitmap $d.Size, $d.Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($source, 0, 0, $d.Size, $d.Size)
    $g.Dispose()
    
    $bmp.Save((Join-Path $dir "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save((Join-Path $dir "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    
    # 2. Generate ic_launcher_foreground.png
    $bmpFg = New-Object System.Drawing.Bitmap $d.FgSize, $d.FgSize
    $gFg = [System.Drawing.Graphics]::FromImage($bmpFg)
    $gFg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gFg.DrawImage($source, 0, 0, $d.FgSize, $d.FgSize)
    $gFg.Dispose()
    
    $bmpFg.Save((Join-Path $dir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpFg.Dispose()
    
    # Remove conflicting webp versions
    Remove-Item (Join-Path $dir "ic_launcher.webp") -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $dir "ic_launcher_round.webp") -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $dir "ic_launcher_foreground.webp") -ErrorAction SilentlyContinue
}

$source.Dispose()
Write-Host "Generated all Android mipmap icons successfully!"

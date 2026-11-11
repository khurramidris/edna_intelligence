Add-Type -AssemblyName System.Drawing
$ednaRoot = Split-Path -Parent $PSScriptRoot
$ednaEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$ednaOptions = [System.Drawing.Imaging.EncoderParameters]::new(1)
$ednaOptions.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]88)
$ednaSources = Get-ChildItem -LiteralPath (Join-Path $ednaRoot 'output\imagegen\products') -Filter '*.png' -File
foreach ($ednaSource in $ednaSources) {
    $ednaImage = [System.Drawing.Image]::FromFile($ednaSource.FullName)
    try {
        $ednaDestination = Join-Path $ednaRoot ('theme\assets\edna-' + $ednaSource.BaseName + '.jpg')
        $ednaImage.Save($ednaDestination, $ednaEncoder, $ednaOptions)
        [PSCustomObject]@{ Asset = [System.IO.Path]::GetFileName($ednaDestination); Width = $ednaImage.Width; Height = $ednaImage.Height; Bytes = (Get-Item -LiteralPath $ednaDestination).Length }
    } finally { $ednaImage.Dispose() }
}

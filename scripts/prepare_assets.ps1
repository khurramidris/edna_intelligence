Add-Type -AssemblyName System.Drawing
$ednaRoot = Split-Path -Parent $PSScriptRoot
$ednaSource = Join-Path $ednaRoot 'ASSETS\EDNA Footwear Luxury Identity Board.png'
$ednaTarget = Join-Path $ednaRoot 'theme\assets\edna-identity-board.jpg'
$ednaImage = [System.Drawing.Image]::FromFile($ednaSource)
try {
    $ednaEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $ednaOptions = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $ednaOptions.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]90)
    $ednaImage.Save($ednaTarget, $ednaEncoder, $ednaOptions)
} finally {
    $ednaImage.Dispose()
}

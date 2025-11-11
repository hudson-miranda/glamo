$files = @(
    "src\analytics-advanced\operations.ts",
    "src\anamnesis\operations.ts",
    "src\loyalty\operations.ts",
    "src\photos\operations.ts",
    "src\referral\operations.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path "d:\emtwo\glamo\Glamo\app" $file
    Write-Host "Fixing $file..."
    
    $content = Get-Content $fullPath -Raw
    $newContent = $content -replace "await requirePermission\(context, args\.salonId, '([^']*)'\);", "await requirePermission(context.user, args.salonId, '`$1', context.entities);"
    
    $newContent | Set-Content $fullPath -NoNewline
    Write-Host "Fixed $file"
}

Write-Host "All files fixed!"

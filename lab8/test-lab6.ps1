# Lab 6 Verification Script

Write-Host "--- Lab 6 Verification ---" -ForegroundColor Cyan

$frontendPath = "frontend"
$srcPath = "$frontendPath/src"
$appPath = "$srcPath/app"

$allPassed = $true

function Check-Requirement($name, $condition) {
    if (&$condition) {
        Write-Host "[PASS] $name" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[FAIL] $name" -ForegroundColor Red
        return $false
    }
}

$allPassed = (Check-Requirement "Part 1: dashboard folder" { Test-Path "$appPath/dashboard" }) -and $allPassed
$allPassed = (Check-Requirement "Part 1: sensors folder" { Test-Path "$appPath/sensors" }) -and $allPassed
$allPassed = (Check-Requirement "Part 1: Private component InternalLogic" { Test-Path "$appPath/dashboard/InternalLogic.tsx" }) -and $allPassed
$allPassed = (Check-Requirement "Part 2: Dashboard layout" { Test-Path "$appPath/dashboard/layout.tsx" }) -and $allPassed
$allPassed = (Check-Requirement "Part 2: Nested settings page" { Test-Path "$appPath/dashboard/settings/page.tsx" }) -and $allPassed
$allPassed = (Check-Requirement "Part 3: Dynamic sensors route" { Test-Path -LiteralPath "$appPath/sensors/[id]" }) -and $allPassed
$allPassed = (Check-Requirement "Part 4: FilterButton client component" { Test-Path "$appPath/sensors/FilterButton.tsx" }) -and $allPassed
$allPassed = (Check-Requirement "Part 5: metadata extraction" { Select-String -LiteralPath "$appPath/sensors/[id]/page.tsx" -Pattern "export async function generateMetadata" }) -and $allPassed
$allPassed = (Check-Requirement "Part 6: Link component usage" { Select-String -Path "$appPath/layout.tsx" -Pattern "<Link" }) -and $allPassed
$allPassed = (Check-Requirement "Part 7: Route group (marketing)" { Test-Path "$appPath/(marketing)" }) -and $allPassed
$allPassed = (Check-Requirement "Part 7: Private utils _lib" { Test-Path "$appPath/sensors/_lib" }) -and $allPassed
$allPassed = (Check-Requirement "Part 8: loading.tsx implementation" { Test-Path "$appPath/sensors/loading.tsx" }) -and $allPassed
$allPassed = (Check-Requirement "Part 8: error.tsx implementation" { Test-Path -LiteralPath "$appPath/sensors/[id]/error.tsx" }) -and $allPassed

if ($allPassed) {
    Write-Host "`nAll Lab 6 requirements verified successfully!" -ForegroundColor Green
} else {
    Write-Host "`nSome requirements failed verification." -ForegroundColor Red
    exit 1
}

Write-Host "`nNext Step: Run 'npm run dev' in frontend/ to manually verify in browser." -ForegroundColor Yellow

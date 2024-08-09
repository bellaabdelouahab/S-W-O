param (
    [string]$Path = ".",
    [string[]]$IgnoreFolders = @()
)

function Get-Tree {
    param (
        [string]$BasePath,
        [string[]]$IgnoreFolders,
        [int]$Indent = 0
    )

    # Get the directory info
    $directoryInfo = Get-ChildItem -Path $BasePath -Directory

    foreach ($directory in $directoryInfo) {
        if ($IgnoreFolders -notcontains $directory.Name) {
            Write-Host (" " * $Indent) + "|-- " + $directory.Name
            Get-Tree -BasePath $directory.FullName -IgnoreFolders $IgnoreFolders -Indent ($Indent + 4)
        }
    }

    # Get the files in the directory
    $fileInfo = Get-ChildItem -Path $BasePath -File
    foreach ($file in $fileInfo) {
        Write-Host (" " * $Indent) + "|-- " + $file.Name
    }
}

# Start the tree from the specified path
Write-Host $Path
Get-Tree -BasePath $Path -IgnoreFolders $IgnoreFolders

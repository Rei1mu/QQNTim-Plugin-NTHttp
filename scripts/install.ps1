$ErrorActionPreference = "Stop"

Set-Location ((Split-Path -Parent $MyInvocation.MyCommand.Definition) + "..")

if ($null -eq $env:QQNTIM_HOME) {
    $env:QQNTIM_HOME = "$UserProfile\.qqntim"
}

$PluginId = (node --eval 'console.log(require("./publish/qqntim.json").id)')
$PluginDir = "$env:QQNTIM_HOME\plugins\$PluginId"

Copy-Item ".\dist" $PluginDir -Recurse -Force

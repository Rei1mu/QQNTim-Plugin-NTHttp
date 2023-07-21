#!/usr/bin/env bash

cd "$( dirname "${BASH_SOURCE[0]}" )/.."

[ ! $QQNTIM_HOME ] && export QQNTIM_HOME="$HOME/.local/share/QQNTim"

plugin_id=$(node --eval 'console.log(require("./publish/qqntim.json").id)')
plugin_dir="$QQNTIM_HOME/plugins/$plugin_id"

[ -d $plugin_dir ] && rm -rf "$plugin_dir"
cp -rf ./dist "$plugin_dir"

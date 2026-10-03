#!/usr/bin/env sh
# Local preview with the real Jekyll (the same engine GitHub Pages uses), so
# the _data/ files, includes and layout render exactly as they will live.
#
# One-time setup (needs Ruby):   gem install --user-install jekyll -v '~> 3.10' webrick
# Then:                          sh tools/preview.sh     ->  http://localhost:4000
#
# No Ruby? Push to a branch instead: CI builds it the same way and fails the
# PR with a message if anything is wrong.
exec jekyll serve --livereload "$@"

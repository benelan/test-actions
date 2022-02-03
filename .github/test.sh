current_branch=$(git rev-parse --abbrev-ref HEAD)
# list of all package.json files changed
packages_changed=$(git diff --name-only $current_branch $(git merge-base $current_branch origin/master -- | grep "**/*.sh"))
echo "package.json files changed: $packages_changed"
# skip if no packages are changed
if [ -z $packages_changed ]; then
  echo "no package.json files changed, skipping build analysis"
else
  echo "analyzing builds"
  echo "::set-output name=skip::false"
fi
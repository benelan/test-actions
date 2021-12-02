#!/bin/bash

protected_branch='master'
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

# first_commit_branch=$(git log --format=%H $current_branch --not $protected_branch | tail -1)
# last_commit_branch=$(git rev-parse HEAD)

conventional_commit_regex='^((build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(\w+\))?(!)?(: (.*\s*)*))|(Merge (.*\s*)*)|(Initial commit$)'

commit_messages=$(git log --format=%B $current_branch --not $protected_branch | tr '\n' ',')
IFS=',,'
read -a array <<< $commit_messages

for message in ${array[@]}
do
    [[ $message =~ $conventional_commit_regex ]] && exit 0
done
exit 1
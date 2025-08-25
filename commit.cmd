set /p commitMassage=CommitMassage:
git add .
git commit -m "%commitMassage%"
git push -uf origin master
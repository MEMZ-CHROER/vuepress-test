set /p commitMassage=CommitMassage:
git add .
git commit -m "更新坦克相关和配置"
git push -uf origin master
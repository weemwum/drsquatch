FILES=$(git diff --name-only HEAD $BASE_SHA | grep -v '\\.*')
PUTS=""
while read -r file
do
PUTS="$PUTS put ./$file -o $CI_BRANCH/$file;"
done <<< "$FILES"
echo "open -u $FTP_USER,$FTP_PASSWORD ftp.cratejoy.com; set ssl:verify-certificate no; $PUTS"

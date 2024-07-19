BASEDIR=$(dirname $0)
echo "Script location: ${BASEDIR}"

rm -rf ${BASEDIR}/build/static/js/bootstrap

npm run build

# Copy from bootstrap to build folder
BASEDIR=$(dirname $0)
cp -r ${BASEDIR}/src/static/js/bootstrap ${BASEDIR}/build/static/js
echo 'Extension built!'